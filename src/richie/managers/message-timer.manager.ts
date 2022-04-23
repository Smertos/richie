import { Timer } from 'richie/models';
import { MessageTimerEntity } from 'richie/db/entities';
import { Bot } from 'richie/bot';
import winston from 'winston';

export class MessageTimerManager {

  private logger: winston.Logger;
  private runningTimers: Map<number, Timer> = new Map<number, Timer>();

  constructor(private bot: Bot) {
    this.logger = this.bot.logger;
  }

  async addTimer(message: string, periodSeconds: number): Promise<MessageTimerEntity> {
    let newTimerModel = new MessageTimerEntity(this.bot.botConfig.channelName, message, periodSeconds);
    newTimerModel = await newTimerModel.save();

    const newTimer = this.makeMessageTimer(newTimerModel);

    this.runTimer(newTimer);

    return newTimerModel;
  }

  async loadSavedTimers(): Promise<void> {
    const savedMessageTimerEntities = await MessageTimerEntity.find({
      where: {
        channelName: this.bot.botConfig.channelName
      }
    });

    for (const messageTimerEntity of savedMessageTimerEntities) {
      const messageTimer = this.makeMessageTimer(messageTimerEntity);

      this.runTimer(messageTimer);
    }
  }

  makeMessageTimer(timerEntity: MessageTimerEntity): Timer {
    const timerCallback = this.makeTimerCallback(timerEntity.message);

    return new Timer(timerEntity.id, timerEntity.periodSeconds * 1000, timerCallback);
  }

  makeTimerCallback(message: string): VoidFunction {
    return (): void => {
      this.bot.chatClient.say(this.bot.botConfig.channelName, message);
    };
  }

  runTimer(timer: Timer): void {
    timer.run();
    this.runningTimers.set(timer.id, timer);
  }

}
