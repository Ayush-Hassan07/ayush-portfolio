import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { AdminAuthGuard } from '../auth/admin-auth.guard';

import { AnalyticsService } from './analytics.service';
import { AnalyticsEventInput } from './analytics.types';

@Controller('analytics')
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
  ) {}

  @Post('event')
  @Throttle({
    default: {
      limit: 120,
      ttl: 60000,
    },
  })
  @HttpCode(HttpStatus.ACCEPTED)
  recordEvent(
    @Body() body: AnalyticsEventInput,
  ) {
    return this.analyticsService.recordEvent(body);
  }

  @Get('statistics')
  @UseGuards(AdminAuthGuard)
  getStatistics(
    @Query('range') range?: string,
    @Query('month') month?: string,
    @Query('year') year?: string,
    @Query('project') project?: string,
    @Query('research') research?: string,
  ) {
    return this.analyticsService.getStatistics(range, month, year, project, research);
  }
}
