'use client';

import { Button, Switch, Card, Divider, Typography, message } from 'antd';
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
  const ts = useTranslations('script');
  const { script } = useScript();
  const { scriptSetting } = useScriptSetting();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [enablePreRelease, setEnablePreRelease] = useState<1 | 2>(
    scriptSetting.enable_pre_release || 2,
  ); // 1: enabled, 2: disabled
  const [grayControls, setGrayControls] = useState<GrayControlValue[]>(
    scriptSetting.gray_controls || [],
  );

  // Load existing gray release configuration
  useEffect(() => {
    const loadGrayControls = async () => {
      try {
        const data = await scriptService.getGrayControls(script.id);
        setEnablePreRelease(data.enable_pre_release as 1 | 2);
        setGrayControls(data.gray_controls || []);
      } catch (error) {
        console.error(ts('publish.load_gray_config_failed'), error);
        // If loading fails, keep default values
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
            {ts('publish.prerelease_and_gray_release')}
          </Title>
          <Text type="secondary">
            {ts('publish.manage_prerelease_and_gray_strategy')}
          </Text>
        </div>
      </div>
      <div className="space-y-4">
        {/* 预发布开关 */}
        <div>
          <Title level={5}>{ts('publish.enable_prerelease')}</Title>
          <Text type="secondary" className="block mb-3">
            {ts('publish.prerelease_description_part1')}
            <a
              href="https://bbs.tampermonkey.net.cn/thread-3384-1-1.html"
              target="_blank"
              rel="noreferrer"
              className="text-blue-500"
            >
              {ts('publish.semantic_version')}
            </a>
            {'<pre-release>'}
            {ts('publish.prerelease_description_part2')}
          </Text>
          <Text type="secondary" className="block mb-2">
            {ts('publish.prerelease_first_enable_tip')}
          </Text>
          <Switch
            checked={enablePreRelease === 1}
            checkedChildren={ts('publish.enable')}
            unCheckedChildren={ts('publish.disable')}
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
                  if (!flag) {
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
            <Title level={5}>{ts('publish.gray_release')}</Title>
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
              {ts('publish.add_strategy')}
            </Button>
          </div>
          <Text type="secondary" className="block mb-4">
            {ts('publish.gray_strategy_description')}
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
                  message.success(ts('publish.gray_strategy_saved'));
                } catch (error) {
                  console.error(ts('publish.save_gray_strategy_failed'), error);
                  message.error(ts('publish.save_failed'));
                } finally {
                  setLoading(false);
                }
              }}
            >
              {ts('publish.save_and_apply_strategy')}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
