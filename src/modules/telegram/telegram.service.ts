import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Telegraf } from 'telegraf';
import { ConfigService } from '@nestjs/config';
import * as productRepository from '../db/product.repository';
import { GoogleGenAI } from "@google/genai";
import { prompt } from './prompt';
import {jsonrepair} from "jsonrepair"

interface MessageState {
  messageId: number;
  text: string;
  keepMessage?: boolean;
}

@Injectable()
export class TelegramService implements OnModuleInit {
  bot: any;
  ai: any;

  constructor(
    private readonly config: ConfigService,
    @Inject(productRepository.ProductRepository)
    private readonly productsRepo: productRepository.ProductRepositoryType,
  ) {
    this.ai = new GoogleGenAI({
      apiKey: this.config.get<string>("GEMINI_API_KEY"),
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

    let result = await this.ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: currentPrompt,
      config: {
        httpOptions: {
          timeout: 300000,
        },
        temperature: 0
      }
    });

    result = result.text;
    result = result.replace('```json', '');
    result = result.replace('```', '');
    result = result.replace('\n', '');
    result = result.replace(/[\x00-\x08\x0B-\x1F\x7F]/g, "");
    result = jsonrepair(result);
    let finalResult = JSON.parse(result);

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
  }
}
