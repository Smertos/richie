import { Bot } from 'richie/bot';

export type TCommandOptions = {
  isAdminOnly: boolean;
  usageArgs: Array<string>;
};

const defaultOptions: TCommandOptions = {
  isAdminOnly: false,
  usageArgs: []
};

export abstract class Command {
  public static readonly prefix: string = '!';

  public isEnabled: boolean = false;
  public options: TCommandOptions = { ...defaultOptions };

  constructor(
    public slug: string,
    public bot: Bot,
    options?: Partial<TCommandOptions>
  ) {
    if (options) {
      this.options = { ...defaultOptions, ...options };
    }
  }

  async disable(): Promise<void> {
    this.isEnabled = false;
  }

  async enable(): Promise<void> {
    this.isEnabled = true;
  }

  abstract execute(user: string, args: Array<string>): Promise<void>;

  get usage(): string {
    const baseUsage = `Usage: ${Command.prefix}${this.slug}`;

    if (this.options.usageArgs.length === 0) {
      return baseUsage;
    }

    const usageArgsJoined = this.options.usageArgs.join(' ')

    return `${baseUsage} ${usageArgsJoined}`;
  }
}
