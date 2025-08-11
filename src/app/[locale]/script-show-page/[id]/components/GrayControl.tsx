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
  return (
    <Card
      size="small"
      style={{
        minWidth: '200px',
      }}
      title={`策略 ${index + 1}`}
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
                <Option value="weight">权重</Option>
                <Option value="pre-release">预发布用户</Option>
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
                        `将会推送${val || 0}%的流量到目标版本`,
                    }}
                  />
                  <Tooltip
                    title={`在${control.params.weight_day}天内，逐渐将流量更新至目标值。如果期望最终完全更新至指定版本，可设置100%，0天为直接更新指定流量至此版本`}
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
                      addonAfter="天"
                    />
                  </Tooltip>
                </>
              )}

              {control.type === 'cookie' && (
                <Input
                  placeholder="Cookie正则表达式"
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

        <Text strong>目标版本</Text>
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
          <Option value="latest">最新版本</Option>
          <Option value="latest^1">上一版本</Option>
          <Option value="all-latest">所有最新版本</Option>
        </Select>
      </div>
    </Card>
  );
};

export default GrayControl;
