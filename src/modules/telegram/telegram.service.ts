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
    this.bot = new Telegraf(this.config.get<string>('TELEGRAM_BOT_APIKEY'));
    await this.initBotListeners();
  }

  async initBotListeners(): Promise<void> {
    //Initialization command
    this.bot.on('text', this.onText.bind(this));

    //Launch bot
    this.bot.launch()
      .then(() => console.log('🤖 Бот запущен'))
      .catch(console.error);
  }

  async onText(ctx: any): Promise<void> {
    const messageText = ctx.message.text;

    if(messageText.includes('/start')) {
      return;
    };

    let currentPrompt = prompt;
    currentPrompt = currentPrompt.replace("$$RAW_PRICES$$", messageText);

    let articles: any = await this.productsRepo.find();
    articles = articles.map((item: any) => item.article).join('\n');

    currentPrompt = currentPrompt.replace("$$ARTICLES$$", articles.length > 0 ? articles: "None");

    let result = await this.ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: currentPrompt,
      config: {
        httpOptions: {
          timeout: 300000,
        }
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

    ctx.deleteMessage();
    ctx.reply('Done.');
  }
}
