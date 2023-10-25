import { useNavigation } from '@remix-run/react';
import { Progress } from 'antd';
import { useEffect, useState } from 'react';

export default function NavigationProcess() {
  const navigation = useNavigation();
  const [percent, setPercent] = useState(0);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (navigation.state === 'loading') {
      setShow(true);
      setPercent(30);
    } else {
      setPercent(100);
      setTimeout(() => {
        setShow(false);
      }, 500);
    }
  }, [navigation]);

  return (
    show && (
      <Progress
        percent={percent}
        className="w-full"
        style={{
          position: 'fixed',
          top: -12,
          height: '2px',
          zIndex: 100,
          // overflow: 'hidden',
        }}
        size="small"
        showInfo={false}
        strokeColor="#1890ff"
        strokeLinecap="butt"
      />
    )
  );
}
