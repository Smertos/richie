import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'message_timers' })
export class MessageTimerEntity extends BaseEntity {

  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  channelName: string;

  @Column()
  message: string;

  @Column()
  periodSeconds: number;

  constructor(channelName: string, message: string, periodSeconds: number) {
    super();

    this.channelName = channelName;
    this.message = message;
    this.periodSeconds = periodSeconds;
  }

}
