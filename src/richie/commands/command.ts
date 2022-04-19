import { Bot } from 'richie/bot';

export class Command {
  public isEnabled: boolean = false;

  constructor(
    public slug: string,
    public bot: Bot
  ) { }

  async disable(): Promise<void> {
    this.isEnabled = false;
  }

  async enable(): Promise<void> {
    this.isEnabled = true;
  }

  async execute(user: string, args: Array<string>): Promise<void> { }
}
