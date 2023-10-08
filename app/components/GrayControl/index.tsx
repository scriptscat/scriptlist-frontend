import { CloseOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Input, Select, Slider, Tooltip } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';

export type GrayControlProps = {
  index: number;
  onClose: (index: number) => void;
  onChange: (index: number, value: GrayControlValue) => void;
  value: GrayControlValue;
};

type Control = {
  type: GrayControlType;
  params: {
    weight?: number;
    weight_day?: number;
    cookie_regex?: string;
  };
};

export type GrayControlValue = {
  target_version: string;
  controls: Control[];
};

type GrayControlType = 'weight' | 'cookie' | 'pre-release';

const GrayControl: React.FC<GrayControlProps> = ({
  index,
  onClose,
  onChange,
  value,
}) => {
  const { t } = useTranslation();

  return (
    <div
      style={{
        minWidth: '200px',
        border: '1px solid',
        padding: '8px',
        marginLeft: '8px',
      }}
      className="flex flex-col gap-1"
    >
      <div className="flex flex-row justify-between">
        <h4 className="text-base">{t('strategy', { index: index + 1 })}</h4>
        <Button
          type="text"
          icon={<CloseOutlined />}
          size="small"
          onClick={() => {
            onClose(index);
          }}
        />
      </div>
      <div className="flex flex-row gap-1">
        {value.controls.map((control, controlsIndex) => (
          <div
            key={controlsIndex}
            className="flex flex-col gap-1"
            style={{ minWidth: '100px' }}
          >
            <Select
              dropdownMatchSelectWidth
              value={control.type}
              onChange={(val) => {
                value.controls[controlsIndex].type = val;
                onChange(index, {
                  target_version: value.target_version,
                  controls: value.controls,
                });
              }}
            >
              <Select.Option value="weight">{t('weight')}</Select.Option>
              <Select.Option value="pre-release">{t('pre_release_user')}</Select.Option>
            </Select>
            {control.type == 'weight' && (
              <>
                <Slider
                  value={control.params.weight}
                  onChange={(val) => {
                    value.controls[controlsIndex].params.weight = val;
                    onChange(index, {
                      target_version: value.target_version,
                      controls: value.controls,
                    });
                  }}
                  tooltip={{
                    formatter: (val?: number) =>
                      t('pre_release_slider_tooltip', { val: val || 0 }),
                  }}
                />
                <Tooltip
                  title={t('pre_release_tooltip', { weight_day: control.params.weight_day })}
                >
                  <Input
                    value={control.params.weight_day}
                    onChange={(val) => {
                      value.controls[controlsIndex].params.weight_day =
                        parseInt(val.target.value);
                      onChange(index, {
                        target_version: value.target_version,
                        controls: value.controls,
                      });
                    }}
                    addonAfter={t('days')}
                  />
                </Tooltip>
              </>
            )}
            {control.type == 'cookie' && (
              <Input placeholder={t('cookie_regex_placeholder')} />
            )}
          </div>
        ))}
        {value.controls.length < 3 && (
          <Button
            type="text"
            icon={<PlusOutlined />}
            size="small"
            onClick={() => {
              onChange(index, {
                target_version: value.target_version,
                controls: [...value.controls, { type: 'weight', params: {} }],
              });
            }}
          />
        )}
        {value.controls.length > 1 && (
          <Button
            type="text"
            icon={<MinusOutlined />}
            size="small"
            onClick={() => {
              onChange(index, {
                target_version: value.target_version,
                controls: value.controls.slice(0, value.controls.length - 1),
              });
            }}
          />
        )}
      </div>
      <h4 className="text-base">{t('pre_release_target_version')}</h4>
      <Tooltip title={t('pre_release_tooltip_version')}>
        <Select
          mode="tags"
          value={value.target_version}
          dropdownMatchSelectWidth
          onChange={(vals) => {
            if (vals.length == 0) {
              onChange(index, {
                target_version: 'latest',
                controls: value.controls,
              });
            } else {
              onChange(index, {
                target_version: vals[vals.length - 1],
                controls: value.controls,
              });
            }
          }}
        >
          <Select.Option value="latest">{t('latest_official_version')}</Select.Option>
          <Select.Option value="pre-latest">{t('latest_pre_release_version')}</Select.Option>
          <Select.Option value="all-latest">{t('latest_version')}</Select.Option>
          <Select.Option value="latest^1">{t('previous_official_version')}</Select.Option>
          <Select.Option value="pre-latest^1">{t('previous_pre_release_version')}</Select.Option>
        </Select>
      </Tooltip>
    </div>
  );
};

export default GrayControl;
