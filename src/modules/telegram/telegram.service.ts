import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Telegraf } from 'telegraf';
import { ConfigService } from '@nestjs/config';
import * as productRepository from '../db/product.repository';
import { prompt } from './prompt';
import {jsonrepair} from "jsonrepair"

import { VertexAI } from '@google-cloud/vertexai';
import * as path from 'path';
import * as fs from 'fs';


interface MessageState {
  messageId: number;
  text: string;
  keepMessage?: boolean;
}

@Injectable()
export class TelegramService implements OnModuleInit {
  bot: any;
  vertex_ai: any;
  generativeModel: any

  constructor(
    private readonly config: ConfigService,
    @Inject(productRepository.ProductRepository)
    private readonly productsRepo: productRepository.ProductRepositoryType,
  ) {
    const keyFilePath = path.join(process.cwd(), 'environments/price-actualizer-475005-649257752563.json');
    const serviceAccount = JSON.parse(fs.readFileSync(keyFilePath, 'utf8'));
    this.vertex_ai = new VertexAI({
      project: 'price-actualizer-475005',
      location: 'europe-west1',
      googleAuthOptions: {
        credentials: {
          client_email: serviceAccount.client_email,
          private_key: serviceAccount.private_key,
        }
      }
    });

    const model = 'gemini-2.5-flash';
    this.generativeModel = this.vertex_ai.getGenerativeModel({
      model: model,
    });
  }

  async onModuleInit() {
    // @ts-ignore
    this.bot = new Telegraf(this.config.get<string>('TELEGRAM_BOT_APIKEY'), {handlerTimeout: 300000});
    await this.initBotListeners();
  }

  async initBotListeners(): Promise<void> {
    //Initialization command
    this.bot.on('text', this.onText.bind(this));

    this.bot.catch((err: any, ctx: any) => {
      console.error(`Encountered a timeout error for ${ctx.updateType}`, err);
    });

    //Launch bot
    this.bot.launch()
      .then(() => console.log('🤖 Бот запущен'))
      .catch(console.error);
  }

  async onText(ctx: any): Promise<void> {
    const messageText = ctx.message.text;
    const chatId = ctx.chat.id;

    if(messageText.includes('/start')) {
      return;
    }

    await ctx.deleteMessage();
    let prevMessage = await ctx.reply('Обрабатываю...')

    let currentPrompt = prompt;
    currentPrompt = currentPrompt.replace("$$RAW_PRICES$$", messageText);

    let articles: any = await this.productsRepo.find();
    articles = articles.map((item: any) => `${item.article}; ${item.aliases.join(", ")}`).join('\n');
    currentPrompt = currentPrompt.replace("$$ARTICLES$$", articles.length > 0 ? articles: "None");
    let finalResult = await this.generatePricesList(currentPrompt);

    if(Array.isArray(finalResult) && finalResult.length > 0) {
      let bulkOps: any[] = finalResult.map((item: any) => {
        if(!item.article) return;

        return {
          updateOne: {
            filter: { article: item.article },
            update: {
              $set: { price: parseInt(item.price) }
            },
            upsert: true
          },
        }
      });

      await this.productsRepo.bulkWrite(bulkOps);

      await this.bot.telegram.deleteMessage(chatId, prevMessage.message_id);
      await this.bot.telegram.sendMessage(chatId, 'Готово 🫡');
    } else {
      await this.bot.telegram.deleteMessage(chatId, prevMessage.message_id);
      await this.bot.telegram.sendMessage(chatId, 'Модели не удалось обработать ответ 🤷');
    }
  }

  async generatePricesList(prompt: string) {
    const req = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generation_config: {
        temperature: 0,
      }
    };

    try {
      const resp = await this.generativeModel.generateContent(req);

      let resultText = '';
      if (resp.response && resp.response.candidates && resp.response.candidates.length > 0 && resp.response.candidates[0].content.parts.length > 0) {
        resultText = resp.response.candidates[0].content.parts[0].text;
      } else {
        // Обработка случая, когда модель вернула пустой ответ
        throw new Error("Не удалось получить контент от модели Vertex AI.");
      }

      resultText = resultText.replace('```json', '');
      resultText = resultText.replace('```', '');
      resultText = resultText.replace(/\n/g, ''); // Заменено на /g для удаления всех переносов
      resultText = resultText.replace(/[\x00-\x08\x0B-\x1F\x7F]/g, "");
      const repairedJson = jsonrepair(resultText);
      return JSON.parse(repairedJson);

    } catch (error) {
      console.error('Произошла ошибка при вызове API:', error);
      return []
    }
  }
}
