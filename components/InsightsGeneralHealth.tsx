import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


export default function InsightsBarChart() {
	const data = [
	  {
	    name: 'Week 1',
	    generalHealth: 50,
	    painLevels: 48,
	    fatigue: 60,
	    mood: 30,
	    emotionWellBeing: 70,
	  },
	  {
	    name: 'Week 2',
	    generalHealth: 25,
	    painLevels: 30,
	    fatigue: 20,
	    mood: 60,
	    emotionWellBeing: 50,
	  },
	  {
	    name: 'Week 3',
	    generalHealth: 60,
	    painLevels: 48,
	    fatigue: 90,
	    mood: 50,
	    emotionWellBeing: 40,
	  },
	  {
	    name: 'Week 4',
	    generalHealth: 30,
	    painLevels: 20,
	    fatigue: 50,
	    mood: 40,
	    emotionWellBeing: 30,
	  },
	];

	
	

	return (

				<div className="w-full h-[400px]">
					<ResponsiveContainer width="100%" height="100%">
		        <LineChart
	          data={data}
	          margin={{
	            bottom: 5,
	          }}
	        >
	          <CartesianGrid strokeDasharray="3 3" />
	          <XAxis dataKey="name" />
	          <YAxis />
	          <Tooltip />
	          <Legend />
	          <Line type="monotone" dataKey="generalHealth" stroke="#d5a2b2" strokeWidth="2" activeDot={{ r: 8 }} />
	          <Line type="monotone" dataKey="painLevels" strokeWidth="2" stroke="#b793b8" />
	          <Line type="monotone" dataKey="fatigue" strokeWidth="2" stroke="#888aba" />
	          <Line type="monotone" dataKey="mood" strokeWidth="2" stroke="#4683b0" />
	          <Line type="monotone" dataKey="emotionWellBeing" strokeWidth="2" stroke="#006d6a" />
	        </LineChart>
		      </ResponsiveContainer>
	      </div>
			
	)
}