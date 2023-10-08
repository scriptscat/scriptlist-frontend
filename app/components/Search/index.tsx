import { SearchOutlined } from '@ant-design/icons';
import { Link, useNavigate, useSearchParams } from '@remix-run/react';
import { Input } from 'antd';
import { useState } from 'react';
import { useLocale } from 'remix-i18next';

// 搜索框样式
const Search: React.FC<{ className?: string }> = ({ className }) => {
  const locale = '/' + useLocale();
  const navigate = useNavigate();
  const params = useSearchParams();
  const [keyword, setKeyword] = useState(params[0].get('keyword') || '');
  const [clsName] = useState(
    (className ? className + ' ' : '') +
      'flex flex-row justify-between items-center px-4 ' +
      'bg-white dark:bg-gray-900 rounded-lg border-2 border-gray-200 dark:border-gray-900'
  );

  return (
    <div className={clsName}>
      <Input
        placeholder="搜索脚本，开启新世界"
        size="large"
        bordered={false}
        defaultValue={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        onPressEnter={(event) => {
          const target = event.target as HTMLInputElement;
          navigate({
            pathname: locale + '/search',
            search: target.value ? `keyword=` + target.value : '',
          });
        }}
      />
      <Link
        to={{
          pathname: locale + '/search',
          search: keyword ? 'keyword=' + keyword : '',
        }}
      >
        <SearchOutlined className="!text-black dark:!text-white text-xl cursor-pointer" />
      </Link>
    </div>
  );
};

export default Search;
