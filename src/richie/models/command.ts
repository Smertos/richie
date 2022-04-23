import { Bot } from 'richie/bot';

export abstract class Command {
  public static readonly prefix: string = '!';

  public isEnabled: boolean = false;

  constructor(
    public slug: string,
    public bot: Bot,
    public usageArgs: Array<string> = []
  ) { }

  async disable(): Promise<void> {
    this.isEnabled = false;
  }

  async enable(): Promise<void> {
    this.isEnabled = true;
  }

  abstract execute(user: string, args: Array<string>): Promise<void>;

  get usage(): string {
    const baseUsage = `Usage: ${Command.prefix}${this.slug}`;

    if (this.usageArgs.length === 0) {
      return baseUsage;
    }

    const usageArgsJoined = this.usageArgs.join(' ')

    return `${baseUsage} ${usageArgsJoined}`;
  }
}
