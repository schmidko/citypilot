import {useState} from 'react'
import {Form, DatePicker, Select, Button, Space} from 'antd'
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
  return `Plan a trip to ${city} from ${startDate} to ${endDate} with interests in: ${interests.join(', ')}`
}

function App() {
  const [form] = Form.useForm()

  const handleSubmit = async (values) => {
    try {
      const {dateRange, city, interests} = values
      if (!dateRange || !city || !interests) {
        console.error('Missing required fields:', {dateRange, city, interests})
        return
      }
      const prompt = generatePrompt(dateRange, city, interests)
      console.log('Generated prompt:', prompt)
      // TODO: Implement AI logic here
    } catch (error) {
      console.error('Error in handleSubmit:', error)
    }
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      minHeight: '100vh',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        maxWidth: 600,
        padding: '20px',
        backgroundColor: '#1f1f1f',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
      }}>
        <div style={{textAlign: 'center', marginBottom: '30px'}}>
          <img
            src="/citypilotlogo.png"
            alt="City Pilot Logo"
            style={{
              maxWidth: '400px',
              marginBottom: '20px'
            }}
          />
        </div>
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
        >
          <Form.Item
            name="dateRange"
            label={<span style={{color: '#fff'}}>Travel Dates</span>}
            rules={[{required: true, message: 'Please select your travel dates'}]}
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
            <Button type="primary" htmlType="submit" block>
              Generate Travel Plan
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}

export default App
