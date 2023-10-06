import { Button, Card, Checkbox, Space } from 'antd';
import { QuestionCircleFilled, CodeFilled } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import UAParser from 'ua-parser-js';
import Search from '~/components/Search';

export default function Index() {
  const [browser, setBrowser] = useState('浏览器');
  const [installUrl] = useState('https://docs.scriptcat.org/use');
  const { t } = useTranslation();

  useEffect(() => {
    const ua = new UAParser(navigator.userAgent);
    //TODO: 跳转到对应的商店
    switch (ua.getBrowser().name) {
      case 'Edge':
        return setBrowser('Edge');
      case 'Chrome':
        return setBrowser('Chrome');
      case 'Firefox':
        return setBrowser('Firefox');
    }
  }, []);

  return (
    <div className="flex flex-col text-black dark:text-white gap-4">
      <div className="flex flex-col items-center gap-2">
        <span className="text-5xl m-0">Script Cat</span>
        <span>{t('subtitle')}</span>
        <Search className="w-4/5" />
        <span className="text-2xl">更强大的脚本执行扩展</span>
        <span>让你的浏览器拥有更多可能</span>
        <div className="flex flex-row justify-center">
          <Space>
            <Checkbox className="checkbox-round !text-base" checked={true}>
              油猴脚本
            </Checkbox>
            <Checkbox className="checkbox-round !text-base" checked={true}>
              后台脚本
            </Checkbox>
            <Checkbox className="checkbox-round !text-base" checked={true}>
              定时脚本
            </Checkbox>
            <Checkbox className="checkbox-round !text-base" checked={true}>
              云端脚本
            </Checkbox>
          </Space>
        </div>
        <Button
          type="primary"
          className="!px-6"
          size="large"
          target={'_blank'}
          href={installUrl}
        >
          将 ScriptCat 添加至 {browser}
        </Button>
      </div>
      <div className="flex flex-row justify-between gap-6">
        <Card className="flex-1 !rounded-xl">
          <div className="text-center">
            <img
              style={{
                width: '64px',
                height: '64px',
                display: 'inline-block',
              }}
              src="/assets/logo.png"
              alt="logo"
            />
            <p className="text-3xl m-0">脚本猫</p>
            <div className="text-left text-gray-500">
              <p className="m-0">
                脚本猫是一个可以执行用户脚本的浏览器扩展，让你的浏览器可以做更多的事情！
                持续兼容油猴脚本中，已兼容90%+的油猴脚本，更多油猴特性完善中。
                并且另外支持更强大的后台脚本和定时脚本!
              </p>
              <p className="m-0 mt-2 font-bold">
                如果您已经安装了其他脚本管理器（Tanmpermonkey（油猴）），可以选择不安装脚本猫。
              </p>
              <p className="m-0 font-bold">
                如果您想使用脚本猫，请先点击
                <a target="_blank" href={installUrl} rel="noreferrer">
                  安装脚本猫。
                </a>
              </p>
            </div>
          </div>
        </Card>
        <Card className="flex-1 !rounded-xl">
          <div className="text-center">
            <QuestionCircleFilled
              className="text-6xl"
              style={{ color: '#4695d5' }}
            />
            <p className="text-3xl m-0">常见问题</p>
            <div className="text-left text-gray-500">
              <p className="m-0 font-bold">1.油猴脚本有什么用？</p>
              <p className="m-0">
                他可以拓展网页功能，去除广告，增加易用性等等，提高你网上冲浪的体验。
              </p>
              <p className="m-0 font-bold"> 2.ScriptCat脚本猫又是什么？</p>
              <p className="m-0">
                参考了油猴的设计思路并且支持油猴脚本，实现了一个后台脚本运行的框架，并且也支持大部分的油猴脚本。推荐直接安装脚本猫，支持的脚本范围更广。
              </p>
              <p className="m-0 font-bold">3.如何使用油猴脚本？</p>
              <p>
                使用油猴脚本首先需要安装油猴管理器，油猴管理器根据不同浏览器安装的方式有所不同。
              </p>
            </div>
          </div>
        </Card>
        <Card className="flex-1 !rounded-xl">
          <div className="text-center">
            <CodeFilled className="text-6xl" style={{ color: '#4695d5' }} />
            <p className="text-3xl m-0">成为开发者</p>
            <div className="text-left text-gray-500">
              <p className="m-0">
                在您成为论坛开发者后，我们可以提供以下福利！
              </p>
              <p className="m-0">1.论坛首页推荐！</p>
              <p className="m-0">
                2.微信公众号文章推荐，公众号叛逆青年旅舍和一之哥哥转发您的文章！
              </p>
              <p className="m-0">
                3.您将被邀请到技术氛围极好的开发者QQ群中，与更多志同道合的开发者进行技术上的交流！
              </p>
              <p className="m-0">
                4.如果您愿意的话，我们也将在论坛、频道等展示您的介绍信息！
              </p>
              <p className="m-0">5.论坛、频道的开发者用户组权限，与众不同！ </p>
              <p className="m-0">6.······</p>
              <p className="m-0">
                如果您也想成为一名开发者，欢迎参考我们的教程，申请地址：
                <a
                  href="https://bbs.tampermonkey.net.cn/thread-1234-1-1.html"
                  target="_blank"
                  rel="noreferrer"
                >
                  油猴中文网
                </a>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
