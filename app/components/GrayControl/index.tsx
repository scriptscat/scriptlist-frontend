import { CloseOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Input, Select, Slider, Tooltip } from 'antd';
import React from 'react';

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
        <h4 className="text-base">策略{index + 1}</h4>
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
              <Select.Option value="weight">权重</Select.Option>
              <Select.Option value="pre-release">预发布用户</Select.Option>
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
                      `将会推送${val || 0}%的流量到目标版本`,
                  }}
                />
                <Tooltip
                  title={
                    '在' +
                    control.params.weight_day +
                    '天内,逐渐将流量更新至目标值,如果期望最终完全更新至指定版本,可设置100%,0天为直接更新指定流量至此版本'
                  }
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
                    addonAfter="天"
                  />
                </Tooltip>
              </>
            )}
            {control.type == 'cookie' && (
              <Input placeholder="cookie正则表达式" />
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
      <h4 className="text-base">目标版本</h4>
      <Tooltip title="除了选择下面的选项外,也可输入任意版本">
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
          <Select.Option value="latest">最新正式版本</Select.Option>
          <Select.Option value="pre-latest">最新预发布版本</Select.Option>
          <Select.Option value="all-latest">最新版本</Select.Option>
          <Select.Option value="latest^1">
            上一正式版本
          </Select.Option>
          <Select.Option value="pre-latest^1">
            上一预发布版本
            </Select.Option>
        </Select>
      </Tooltip>
    </div>
  );
};

export default GrayControl;
