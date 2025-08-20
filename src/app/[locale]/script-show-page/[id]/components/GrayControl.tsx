import { DeleteOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Input,
  InputNumber,
  Select,
  Slider,
  Tooltip,
  Typography,
} from 'antd';
import React from 'react';
import { useTranslations } from 'next-intl';

const { Text } = Typography;
const { Option } = Select;

export type GrayControlProps = {
  index: number;
  onDelete: (index: number) => void;
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
  onDelete,
  onChange,
  value,
}) => {
  const t = useTranslations('script.gray_control');
  
  return (
    <Card
      size="small"
      style={{
        minWidth: '200px',
      }}
      title={t('strategy_title', { index: index + 1 })}
      extra={
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => onDelete(index)}
        />
      }
    >
      <div className="flex flex-col">
        <div className="flex flex-row gap-1">
          {value.controls.map((control, controlsIndex) => (
            <div
              key={controlsIndex}
              className="flex flex-col gap-1"
              style={{ minWidth: '100px' }}
            >
              <Select
                value={control.type}
                onChange={(newType) => {
                  const updatedControls = [...value.controls];
                  updatedControls[controlsIndex] = {
                    type: newType,
                    params:
                      newType === 'weight'
                        ? { weight: 100, weight_day: 0 }
                        : newType === 'pre-release'
                          ? {}
                          : { cookie_regex: '' },
                  };
                  onChange(index, {
                    ...value,
                    controls: updatedControls,
                  });
                }}
                className="w-full"
              >
                <Option value="weight">{t('weight')}</Option>
                <Option value="pre-release">{t('pre_release_users')}</Option>
              </Select>

              {control.type === 'weight' && (
                <>
                  <Slider
                    value={control.params.weight}
                    onChange={(val) => {
                      const updatedControls = [...value.controls];
                      updatedControls[controlsIndex] = {
                        ...updatedControls[controlsIndex],
                        params: {
                          ...updatedControls[controlsIndex].params,
                          weight: val,
                        },
                      };
                      onChange(index, {
                        ...value,
                        controls: updatedControls,
                      });
                    }}
                    tooltip={{
                      formatter: (val?: number) =>
                        t('traffic_tooltip', { percent: val || 0 }),
                    }}
                  />
                  <Tooltip
                    title={t('weight_day_tooltip', { days: control.params.weight_day || 0 })}
                  >
                    <Input
                      value={control.params.weight_day}
                      onChange={(val) => {
                        const updatedControls = [...value.controls];
                        updatedControls[controlsIndex] = {
                          ...updatedControls[controlsIndex],
                          params: {
                            ...updatedControls[controlsIndex].params,
                            weight_day: parseInt(val.target.value) || 0,
                          },
                        };
                        onChange(index, {
                          ...value,
                          controls: updatedControls,
                        });
                      }}
                      addonAfter={t('days_suffix')}
                    />
                  </Tooltip>
                </>
              )}

              {control.type === 'cookie' && (
                <Input
                  placeholder={t('cookie_regex_placeholder')}
                  value={control.params.cookie_regex}
                  onChange={(val) => {
                    const updatedControls = [...value.controls];
                    updatedControls[controlsIndex] = {
                      ...updatedControls[controlsIndex],
                      params: {
                        ...updatedControls[controlsIndex].params,
                        cookie_regex: val.target.value,
                      },
                    };
                    onChange(index, {
                      ...value,
                      controls: updatedControls,
                    });
                  }}
                />
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
                  controls: [
                    ...value.controls,
                    { type: 'weight', params: { weight: 100, weight_day: 0 } },
                  ],
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

        <Text strong>{t('target_version')}</Text>
        <Select
          value={value.target_version}
          onChange={(newValue) => {
            onChange(index, {
              ...value,
              target_version: newValue,
            });
          }}
          className="w-full"
        >
          <Option value="latest">{t('latest_version')}</Option>
          <Option value="latest^1">{t('previous_version')}</Option>
          <Option value="all-latest">{t('all_latest_versions')}</Option>
        </Select>
      </div>
    </Card>
  );
};

export default GrayControl;
