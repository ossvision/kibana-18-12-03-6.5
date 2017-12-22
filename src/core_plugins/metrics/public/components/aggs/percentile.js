import PropTypes from 'prop-types';
import React, { Component } from 'react';
import _ from 'lodash';
import AggSelect from './agg_select';
import FieldSelect from './field_select';
import AggRow from './agg_row';
import createChangeHandler from '../lib/create_change_handler';
import createSelectHandler from '../lib/create_select_handler';
import { Percentiles } from './percentiles';
import { createNewPercentile } from '../lib/create_new_percentile';

class PercentileAgg extends Component {
  // eslint-disable-line react/no-multi-comp

  componentWillMount() {
    if (!this.props.model.percentiles) {
      this.props.onChange(
        _.assign({}, this.props.model, {
          percentiles: [createNewPercentile({ value: 50 })],
        })
      );
    }
  }

  render() {
    const { series, model, panel, fields } = this.props;

    const handleChange = createChangeHandler(this.props.onChange, model);
    const handleSelectChange = createSelectHandler(handleChange);
    const indexPattern =
      (series.override_index_pattern && series.series_index_pattern) ||
      panel.index_pattern;

    return (
      <AggRow
        disableDelete={this.props.disableDelete}
        model={this.props.model}
        onAdd={this.props.onAdd}
        onDelete={this.props.onDelete}
        siblings={this.props.siblings}
      >
        <div className="vis_editor__row_item">
          <div className="vis_editor__agg_row-item">
            <div className="vis_editor__row_item">
              <div className="vis_editor__label">Aggregation</div>
              <AggSelect
                panelType={this.props.panel.type}
                timerangeMode={this.props.panel.timerangeMode}
                siblings={this.props.siblings}
                value={model.type}
                onChange={handleSelectChange('type')}
              />
            </div>
            <div className="vis_editor__row_item">
              <div className="vis_editor__label">Field</div>
              <FieldSelect
                fields={fields}
                type={model.type}
                restrict="numeric"
                indexPattern={indexPattern}
                value={model.field}
                onChange={handleSelectChange('field')}
              />
            </div>
          </div>
          <Percentiles
            onChange={handleChange}
            name="percentiles"
            model={model}
          />
        </div>
      </AggRow>
    );
  }
}

PercentileAgg.propTypes = {
  disableDelete: PropTypes.bool,
  fields: PropTypes.object,
  model: PropTypes.object,
  onAdd: PropTypes.func,
  onChange: PropTypes.func,
  onDelete: PropTypes.func,
  panel: PropTypes.object,
  series: PropTypes.object,
  siblings: PropTypes.array,
};

export default PercentileAgg;
