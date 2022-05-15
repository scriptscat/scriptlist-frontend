import { Card } from 'antd';

export default function Index() {
  return (
    <>
      <div className="flex flex-col gap-3">
        <Card>
				 <Card.Grid>
					 123
				 </Card.Grid>
				 <Card.Grid>
					 123
				 </Card.Grid>
        </Card>
		<Card>
          <div></div>
        </Card>
      </div>
    </>
  );
}
