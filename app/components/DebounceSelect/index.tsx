import { useMemo, useRef, useState } from 'react';
import { debounce } from 'lodash';
import { Select, SelectProps, Spin } from 'antd';
export interface DebounceSelectProps<ValueType = any>
  extends Omit<SelectProps<ValueType | ValueType[]>, 'options' | 'children'> {
  fetchOptions: (search: string) => Promise<ValueType[]>;
  debounceTimeout?: number;
  maxCount?: number;
}

export function DebounceSelect<
  ValueType extends {
    key?: string;
    label: React.ReactNode;
    value: string | number;
  } = any
>({
  fetchOptions,
  debounceTimeout = 800,
  maxCount,
  onChange,
  ...props
}: DebounceSelectProps<ValueType>) {
  const [fetching, setFetching] = useState(false);
  const [options, setOptions] = useState<ValueType[]>([]);
  const fetchRef = useRef(0);

  const debounceFetcher = useMemo(() => {
    const loadOptions = (value: string) => {
      fetchRef.current += 1;
      const fetchId = fetchRef.current;
      setOptions([]);
      setFetching(true);

      fetchOptions(value).then((newOptions) => {
        if (fetchId !== fetchRef.current) {
          // for fetch callback order
          return;
        }

        setOptions(newOptions);
        setFetching(false);
      });
    };

    return debounce(loadOptions, debounceTimeout);
  }, [fetchOptions, debounceTimeout]);
  const hanldeChange = (
    value: ValueType | ValueType[],
    option: ValueType | ValueType[]
  ) => {
    if (maxCount !== undefined && value !== undefined && Array.isArray(value)) {
      if (value.length > maxCount) {
        value = value.slice(value.length - maxCount, value.length);
      }
    }
    onChange && onChange(value, value);
  };

  return (
    <Select
  
      filterOption={false}
      onSearch={debounceFetcher}
      notFoundContent={
        fetching ? (
          <div className='flex justify-center items-center min-h-[50px]'>
            <Spin size="small" />
          </div>
        ) : null
      }
      onChange={hanldeChange}
      {...props}
      options={options}
    />
  );
}
