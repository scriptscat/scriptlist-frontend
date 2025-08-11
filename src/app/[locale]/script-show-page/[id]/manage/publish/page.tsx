'use client';

import {
  Button,
  Input,
  Select,
  Alert,
  Switch,
  Card,
  Divider,
  Typography,
  message,
  Collapse,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import GrayControl, {
  type GrayControlValue,
} from '../../components/GrayControl';
import { useScript } from '../../components/ScriptContext';
import { scriptService } from '@/lib/api/services/scripts';
import { useScriptSetting } from '@/contexts/ScriptSettingContext';

const { Title, Text } = Typography;

export default function PublishPage() {
  const t = useTranslations();
  const { script } = useScript();
  const { scriptSetting } = useScriptSetting();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [enablePreRelease, setEnablePreRelease] = useState<1 | 2>(
    scriptSetting.enable_pre_release || 2,
  ); // 1: 开启, 2: 关闭
  const [grayControls, setGrayControls] = useState<GrayControlValue[]>(
    scriptSetting.gray_controls || [],
  );

  // 加载现有的灰度发布配置
  useEffect(() => {
    const loadGrayControls = async () => {
      try {
        const data = await scriptService.getGrayControls(script.id);
        setEnablePreRelease(data.enable_pre_release as 1 | 2);
        setGrayControls(data.gray_controls || []);
      } catch (error) {
        console.error('加载灰度发布配置失败:', error);
        // 如果加载失败，保持默认值
      } finally {
        setInitialLoading(false);
      }
    };

    loadGrayControls();
  }, [script.id]);

  return (
    <Card className="shadow-sm" loading={initialLoading}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={3} className="!mb-1">
            预发布和灰度发布
          </Title>
          <Text type="secondary">管理脚本的预发布和灰度发布策略</Text>
        </div>
      </div>
      <div className="space-y-4">
        {/* 预发布开关 */}
        <div>
          <Title level={5}>启用预发布</Title>
          <Text type="secondary" className="block mb-3">
            开启预发布开关时，当版本符合
            <a
              href="https://bbs.tampermonkey.net.cn/thread-3384-1-1.html"
              target="_blank"
              rel="noreferrer"
              className="text-blue-500"
            >
              语义化版本
            </a>
            {'<pre-release>'}
            时更新脚本将会自动标记为预发布版本，并且会在脚本首页提供预发布版本的安装按钮。
          </Text>
          <Text type="secondary" className="block mb-2">
            (首次开启会帮你新增三条策略：预发布用户更新到全部最新，正式版按权重在10天内逐步更新至最新正式版本，其它用户更新到上一正式版本)
          </Text>
          <Switch
            checked={enablePreRelease === 1}
            checkedChildren="开启"
            unCheckedChildren="关闭"
            onClick={(value) => {
              setGrayControls((prev) => {
                if (value) {
                  let flag = false;
                  prev.forEach((val) => {
                    val.controls.forEach((v) => {
                      if (v.type === 'pre-release') {
                        flag = true;
                      }
                    });
                  });
                  !flag &&
                    prev.push(
                      {
                        target_version: 'all-latest',
                        controls: [
                          {
                            type: 'pre-release',
                            params: {},
                          },
                        ],
                      },
                      {
                        target_version: 'latest',
                        controls: [
                          {
                            type: 'weight',
                            params: {
                              weight: 100,
                              weight_day: 10,
                            },
                          },
                        ],
                      },
                      {
                        target_version: 'latest^1',
                        controls: [
                          {
                            type: 'weight',
                            params: {
                              weight: 100,
                              weight_day: 0,
                            },
                          },
                        ],
                      },
                    );
                }
                return [...prev];
              });
              setEnablePreRelease(value ? 1 : 2);
            }}
          />
        </div>

        <Divider />

        {/* 灰度发布策略 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Title level={5}>灰度发布</Title>
            <Button
              type="text"
              icon={<PlusOutlined />}
              size="large"
              onClick={() => {
                setGrayControls((prev) => {
                  prev.push({
                    target_version: 'latest',
                    controls: [
                      {
                        type: 'weight',
                        params: {
                          weight: 100,
                          weight_day: 10,
                        },
                      },
                    ],
                  });
                  return [...prev];
                });
              }}
            >
              添加策略
            </Button>
          </div>
          <Text type="secondary" className="block mb-4">
            可配置一定的策略(策略有顺序性)，使你的脚本用户更新到指定版本
          </Text>

          <div className="flex flex-row flex-wrap gap-3">
            {grayControls.map((control, index) => (
              <GrayControl
                key={index}
                index={index}
                value={control}
                onDelete={(index) => {
                  setGrayControls((prev) => {
                    const newControls = [...prev];
                    newControls.splice(index, 1);
                    return newControls;
                  });
                }}
                onChange={(index, value) => {
                  setGrayControls((prev) => {
                    const newControls = [...prev];
                    newControls[index] = value;
                    return newControls;
                  });
                }}
              />
            ))}
          </div>

          {grayControls.length > 0 && (
            <Button
              type="primary"
              loading={loading}
              className="mt-4"
              onClick={async () => {
                setLoading(true);
                try {
                  await scriptService.updateGrayControls(
                    script.id,
                    enablePreRelease,
                    grayControls,
                  );
                  message.success('灰度发布策略已保存');
                } catch (error) {
                  console.error('保存灰度发布策略失败:', error);
                  message.error('保存失败');
                } finally {
                  setLoading(false);
                }
              }}
            >
              保存并应用策略
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
