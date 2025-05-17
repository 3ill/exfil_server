import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AutomationProvider } from '../provider/automation.provider';
import { IScheduleTransfer } from '../interface/automation.interface';

@Injectable()
export class AutomationService {
  constructor(private readonly automationProvider: AutomationProvider) {}

  async executeTransfer(args: IScheduleTransfer) {
    try {
      const result = await this.automationProvider.scheduleTransfer(args);
      console.log(result);
      return result;
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'An error occurred while executing transfer',
        HttpStatus.OK,
        {
          cause: error,
        },
      );
    }
  }
}
