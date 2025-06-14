import {useState} from 'react'
import {Form, DatePicker, Select, Button, Space, Spin, Card} from 'antd'
import {ClockCircleOutlined, EnvironmentOutlined, InfoCircleOutlined, TagOutlined} from '@ant-design/icons'
import axios from 'axios'
import dayjs from 'dayjs'
import './App.css'

const {RangePicker} = DatePicker

const europeanCities = [
  {value: 'london', label: 'London'},
  {value: 'paris', label: 'Paris'},
  {value: 'berlin', label: 'Berlin'},
  {value: 'rome', label: 'Rome'},
  {value: 'madrid', label: 'Madrid'},
  {value: 'amsterdam', label: 'Amsterdam'},
  {value: 'vienna', label: 'Vienna'},
  {value: 'prague', label: 'Prague'},
  {value: 'budapest', label: 'Budapest'},
  {value: 'warsaw', label: 'Warsaw'}
]

const predefinedInterests = [
  {value: 'culture', label: 'Culture'},
  {value: 'food', label: 'Food'},
  {value: 'shopping', label: 'Shopping'},
  {value: 'nature', label: 'Nature'},
  {value: 'history', label: 'History'},
  {value: 'art', label: 'Art'},
  {value: 'music', label: 'Music'},
  {value: 'sports', label: 'Sports'}
]

const generatePrompt = (dateRange, city, interests) => {
  const startDate = dayjs(dateRange[0]).format('YYYY-MM-DD')
  const endDate = dayjs(dateRange[1]).format('YYYY-MM-DD')
  return `${city} from ${startDate} to ${endDate} interests: ${interests.join(', ')}`
}

function App() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleSubmit = async (values) => {
    try {
      setLoading(true)
      setError(null)
      setResult(null)

      const {dateRange, city, interests} = values
      if (!dateRange || !city || !interests) {
        console.error('Missing required fields:', {dateRange, city, interests})
        return
      }

      const prompt = generatePrompt(dateRange, city, interests)
      console.log('Generated prompt:', prompt)

      const response = await axios.post(
        'http://servant.nams.de:8006/api/v1/prediction/a2f49ef2-5b62-42a2-9549-c891e18c9a6e',
        {question: prompt},
        {headers: {'Content-Type': 'application/json'}}
      )

      console.log('API Response:', response.data)

      // Extract Tourguide entry from agentReasoning
      let tourguideData = null;
      if (response.data?.agentReasoning && Array.isArray(response.data.agentReasoning)) {
        tourguideData = response.data.agentReasoning.find(
          entry => entry.agentName === 'Tourguide'
        )
      }

      // If tourguide data exists, parse the messages string to JSON
      let parsedResult = null;
      if (tourguideData && tourguideData.messages) {
        try {
          parsedResult = JSON.parse(tourguideData.messages);
          console.log('Parsed messages:', parsedResult);
        } catch (parseError) {
          console.error('Error parsing messages JSON:', parseError);
          parsedResult = tourguideData.messages; // fallback to original string
        }
      }

      setResult(parsedResult || tourguideData)
      console.log('Final result:', parsedResult || tourguideData)
    } catch (error) {
      console.error('Error in handleSubmit:', error)
      setError(error.message || 'An error occurred while processing your request')
    } finally {
      setLoading(false)
    }
  }

  const renderItinerary = (itinerary) => {
    console.log('lol', itinerary);

    if (!Array.isArray(itinerary)) return null;

    return itinerary.map((day, dayIndex) => (
      <div key={dayIndex} className="day-container">
        {/* Day Header */}
        <h3 className="day-header">
          {dayjs(day.date).format('dddd, MMMM D, YYYY')}
        </h3>

        {/* Activities for this day */}
        <div className="activities-container">
          {day.activities && day.activities.map((activity, activityIndex) => (
            <Card
              key={activityIndex}
              className="activity-card"
              styles={{body: {padding: '16px'}}}
            >
              <div className="activity-content">
                {/* Activity Header */}
                <div className="activity-header">
                  <div className="activity-title-container">
                    {/* Title - now using location */}
                    {activity.location && (
                      <h3 className="activity-title">
                        {activity.location}
                      </h3>
                    )}
                    {/* Activity Name */}
                    <h4 className="activity-name">
                      {activity.activity}
                    </h4>
                  </div>
                  <span className="activity-time">
                    <ClockCircleOutlined />
                    {activity.time}
                  </span>
                </div>

                {/* Description */}
                {activity.description && (
                  <div className="activity-detail description">
                    <InfoCircleOutlined style={{marginTop: '2px'}} />
                    <span className="activity-detail-text description">
                      {activity.description}
                    </span>
                  </div>
                )}

                {/* Ticket Info */}
                {activity.ticket_info && (
                  <div className="ticket-info">
                    <TagOutlined style={{marginTop: '2px'}} />
                    <div>
                      <div>
                        Price: {typeof activity.ticket_info === 'string'
                          ? activity.ticket_info
                          : activity.ticket_info.price}
                      </div>
                      {typeof activity.ticket_info === 'object' && activity.ticket_info.link && (
                        <div>
                          <a
                            href={activity.ticket_info.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{color: '#ffa940', textDecoration: 'underline'}}
                          >
                            Book tickets
                          </a>
                        </div>
                      )}
                      {activity.booking_link && (
                        <div>
                          <a
                            href={activity.booking_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{color: '#ffa940', textDecoration: 'underline'}}
                          >
                            Booking link
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    ));
  };

  return (
    <div className="main-container">
      {/* Form Box */}
      <div className="form-box">
        <div className="logo-container">
          <img
            src="/citypilotlogo.png"
            alt="City Pilot Logo"
            className="logo"
          />
        </div>
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
        >
          <Form.Item
            name="dateRange"
            label={<span style={{color: '#fff'}}>Activity Dates</span>}
            rules={[{required: true, message: 'Please select your activity dates'}]}
          >
            <RangePicker style={{width: '100%'}} />
          </Form.Item>

          <Form.Item
            name="city"
            label={<span style={{color: '#fff'}}>Destination City</span>}
            rules={[{required: true, message: 'Please select a city'}]}
          >
            <Select
              options={europeanCities}
              placeholder="Select a city"
            />
          </Form.Item>

          <Form.Item
            name="interests"
            label={<span style={{color: '#fff'}}>Interests</span>}
            rules={[{required: true, message: 'Please select at least one interest'}]}
          >
            <Select
              mode="tags"
              style={{width: '100%'}}
              placeholder="Select interests or add your own"
              options={predefinedInterests}
              allowClear
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Generate Activity Plan
            </Button>
          </Form.Item>
        </Form>
      </div>

      {/* Results Box - Always present but conditionally filled */}
      <div className="results-box">
        <h2 className="results-title">Activity Plan</h2>

        {loading && (
          <div className="loading-container">
            <Spin size="large" />
            <p className="loading-text">
              Generating your travel plan...
            </p>
          </div>
        )}

        {error && (
          <div className="error-container">
            <strong>Error:</strong> {error}
          </div>
        )}

        {result && !loading && (
          <div>
            {result.tour_itinerary ? (
              renderItinerary(result.tour_itinerary)
            ) : (
              <div className="json-container">
                {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
              </div>
            )}
          </div>
        )}

        {!result && !loading && !error && (
          <div className="placeholder-container">
            Click "Generate Activity Plan" to see your itinerary here.
          </div>
        )}
      </div>
    </div>
  )
}

export default App
