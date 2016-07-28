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

import React, { PropTypes } from 'react';

import * as datetime from '../../../utils/datetime';
import { displayBgValue } from '../../../utils/format';

import styles from './ChartExplainer.css';

const ChartExplainer = (props) => {
  const { bgUnits, focusedSlice: slice } = props;
  if (slice === null) {
    return null;
  }
  const fromTime = datetime.formatDurationToClocktime(slice.msFrom);
  const toTime = datetime.formatDurationToClocktime(slice.msTo);

  return (
    <div className={styles.container} id="trendsCbgExplainer">
      <div>
        <h3 className={styles.header}>{`From ${fromTime} to ${toTime}:`}</h3>
        <p className={styles.text}>
          Half of your readings are between&nbsp;
          <span className={styles.number}>
            {displayBgValue(slice.firstQuartile, bgUnits)}
          </span> and&nbsp;
          <span className={styles.number}>
            {displayBgValue(slice.thirdQuartile, bgUnits)}
          </span>
        </p>
        <p className={styles.text}>
          Most of your readings are between&nbsp;
          <span className={styles.number}>
            {displayBgValue(slice.tenthQuantile, bgUnits)}
          </span> and&nbsp;
          <span className={styles.number}>
            {displayBgValue(slice.ninetiethQuantile, bgUnits)}
          </span>
        </p>
      </div>
      <div>
        <p className={styles.text}>
          Highest: <span className={styles.number}>{displayBgValue(slice.max, bgUnits)}</span>
        </p>
        <p className={styles.text}>
          Middle: <span className={styles.number}>{displayBgValue(slice.median, bgUnits)}</span>
        </p>
        <p className={styles.text}>
          Lowest: <span className={styles.number}>{displayBgValue(slice.min, bgUnits)}</span>
        </p>
      </div>
    </div>
  );
};

ChartExplainer.defaultProps = {
  focusedSlice: null,
};

ChartExplainer.propTypes = {
  bgUnits: PropTypes.oneOf(['mg/dL', 'mmol/L']).isRequired,
  focusedSlice: PropTypes.object,
};

export default ChartExplainer;
