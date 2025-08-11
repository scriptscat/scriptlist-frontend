'use client';

import { Card, Typography } from 'antd';

const { Title, Text } = Typography;

interface StatCardProps {
  value: string;
  label: string;
  color: string;
}

export default function StatCard({ value, label, color }: StatCardProps) {
  return (
    <Card className="text-center">
      <Title level={3} className={`!mb-1 text-${color}-600`}>
        {value}
      </Title>
      <Text type="secondary" className="text-sm">
        {label}
      </Text>
    </Card>
  );
}
