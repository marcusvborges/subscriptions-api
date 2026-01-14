import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PlanService } from './plan.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { CreatePriceDto } from './dto/create-price.dto';
import { UpdatePriceDto } from './dto/update-price.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Plans')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard('jwt'))
@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlanService) {}

  @Post()
  create(@Body() createPlanDto: CreatePlanDto) {
    return this.plansService.create(createPlanDto);
  }

  @Get()
  findAll() {
    return this.plansService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.plansService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePlanDto: UpdatePlanDto) {
    return this.plansService.update(id, updatePlanDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.plansService.remove(id);
  }

  @Post(':planId/prices')
  createPrice(
    @Param('planId') planId: string,
    @Body() createPriceDto: CreatePriceDto,
  ) {
    return this.plansService.createPrice(planId, createPriceDto);
  }

  @Get(':planId/prices')
  findPrices(@Param('planId') planId: string) {
    return this.plansService.findPricesByPlan(planId);
  }

  @Patch('prices/:id')
  updatePrice(
    @Param('id') id: string,
    @Body() updatePriceDto: UpdatePriceDto,
  ) {
    return this.plansService.updatePrice(id, updatePriceDto);
  }

  @Delete('prices/:id')
  removePrice(@Param('id') id: string) {
    return this.plansService.removePrice(id);
  }
}
