/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2016, Tidepool Project
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the License for more details.
 *
 * You should have received a copy of the License along with this program; if
 * not, you can obtain one from Tidepool Project at tidepool.org.
 * == BSD2 LICENSE ==
 */

import _ from 'lodash';

import * as datetime from '../datetime';
import * as format from '../format';

export const DISPLAY_PRESCION_PLACES = 3;
export const MGDL_UNITS = 'mg/dL';
export const MMOLL_UNITS = 'mmol/L';

function noData(val) {
  return val === null || (typeof val === 'undefined');
}

function getBasalRate(scheduleData, startTime) {
  const rate = scheduleData.filter(s => s.start === startTime).map(s => s.rate)[0];
  if (noData(rate)) {
    return '';
  }
  return format.displayDecimal(rate, DISPLAY_PRESCION_PLACES);
}

function getValue(scheduleData, fieldName, startTime) {
  const val = scheduleData.filter(s => s.start === startTime).map(s => s[fieldName])[0];
  if (noData(val)) {
    return '';
  }
  return val;
}

function getBloodGlucoseValue(scheduleData, fieldName, startTime, units) {
  const bgValue = getValue(scheduleData, fieldName, startTime);
  if (noData(bgValue)) {
    return '';
  }
  return format.displayBgValue(bgValue, units);
}

export function getTotalBasalRates(scheduleData) {
  const HOUR_IN_MILLISECONDS = 60 * 60 * 1000;
  const DAY_IN_MILLISECONDS = 86400000;

  let total = 0;
  for (let i = scheduleData.length - 1; i >= 0; i--) {
    const start = scheduleData[i].start;
    let finish = DAY_IN_MILLISECONDS;
    const next = i + 1;
    if (next < scheduleData.length) {
      finish = scheduleData[next].start;
    }
    const hrs = (finish - start) / HOUR_IN_MILLISECONDS;
    total += (scheduleData[i].rate * hrs);
  }
  return format.displayDecimal(total, DISPLAY_PRESCION_PLACES);
}

export function getScheduleLabel(scheduleName, activeName) {
  if (scheduleName === activeName) {
    return `${scheduleName} (Active at upload)`;
  }
  return scheduleName;
}

export function getScheduleNames(settingsData) {
  return _.keysIn(settingsData);
}

export function getTimedSchedules(settingsData) {
  const names = _.map(settingsData, 'name');
  const schedules = [];
  for (let i = names.length - 1; i >= 0; i--) {
    schedules.push({ name: names[i], position: i });
  }
  return schedules;
}

export function getDeviceMeta(settingsData) {
  return {
    name: settingsData.deviceId || 'unknown',
    schedule: settingsData.activeSchedule || 'unknown',
    uploaded: datetime.formatDisplayDate(settingsData.deviceTime) || 'unknown',
  };
}

export function processBasalRateData(scheduleData) {
  const starts = scheduleData.value.map(s => s.start);
  const noRateData = [{ start: '-', rate: '-' }];

  if (starts.length === 0) {
    return noRateData;
  } else if (starts.length === 1) {
    if (Number(getBasalRate(scheduleData.value, starts[0])) === 0) {
      return noRateData;
    }
  }

  const data = starts.map((startTime) => ({
    start: datetime.millisecondsAsTimeOfDay(
      startTime
    ),
    rate: getBasalRate(
      scheduleData.value,
      startTime
    ),
  }));

  data.push({
    start: 'Total',
    rate: getTotalBasalRates(scheduleData.value),
  });

  return data;
}

export function processBgTargetData(targetsData, bgUnits, keys) {
  const starts = targetsData.map(s => s.start);

  return starts.map((startTime) => ({
    start: datetime.millisecondsAsTimeOfDay(
      startTime
    ),
    columnTwo: getBloodGlucoseValue(
      targetsData,
      keys.columnTwo,
      startTime,
      bgUnits
    ),
    columnThree: getBloodGlucoseValue(
      targetsData,
      keys.columnThree,
      startTime,
      bgUnits
    ),
  }));
}

export function processCarbRatioData(carbRatioData) {
  const starts = carbRatioData.map(s => s.start);
  return starts.map((startTime) => ({
    start: datetime.millisecondsAsTimeOfDay(
      startTime
    ),
    amount: getValue(
      carbRatioData,
      'amount',
      startTime
    ),
  }));
}

export function processSensitivityData(sensitivityData, bgUnits) {
  const starts = sensitivityData.map(s => s.start);
  return starts.map((startTime) => ({
    start: datetime.millisecondsAsTimeOfDay(
      startTime
    ),
    amount: getBloodGlucoseValue(
      sensitivityData,
      'amount',
      startTime,
      bgUnits
    ),
  }));
}

export function processTimedSettings(pumpSettings, schedule, bgUnits) {
  const starts = pumpSettings.bgTargets[schedule.name].map(s => s.start);

  const data = starts.map((startTime) => ({
    start: datetime.millisecondsAsTimeOfDay(
      startTime,
    ),
    rate: getBasalRate(
      pumpSettings.basalSchedules[schedule.position].value,
      startTime,
    ),
    bgTarget: getBloodGlucoseValue(
      pumpSettings.bgTargets[schedule.name],
      'target',
      startTime,
      bgUnits,
    ),
    carbRatio: getValue(
      pumpSettings.carbRatios[schedule.name],
      'amount',
      startTime,
    ),
    insulinSensitivity: getBloodGlucoseValue(
      pumpSettings.insulinSensitivities[schedule.name],
      'amount',
      startTime,
      bgUnits,
    ),
  }));

  data.push({
    start: 'Total',
    rate: getTotalBasalRates(
      pumpSettings.basalSchedules[schedule.position].value,
    ),
    bgTarget: '',
    carbRatio: '',
    insulinSensitivity: '',
  });

  return data;
}

