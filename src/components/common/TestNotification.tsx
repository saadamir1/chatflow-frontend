'use client';

import { useMutation } from '@apollo/client';
import { CREATE_NOTIFICATION } from '../../graphql/operations';

export default function TestNotification() {
  const [createNotification] = useMutation(CREATE_NOTIFICATION, { 
    errorPolicy: 'all',
    onCompleted: (data) => {
      console.log('Notification created successfully:', data);
      alert('Test notification created!');
    },
    onError: (error) => {
      console.error('Error creating notification:', error);
      alert(`Error: ${error.message}`);
    }
  });

  const handleTest = async () => {
    console.log('Testing notification creation...');
    try {
      const result = await createNotification({
        variables: {
          title: 'Test Notification',
          message: 'This is a test notification from frontend',
          type: 'system',
          userId: 169 // Saadamir's ID
        }
      });
      console.log('Test result:', result);
      if (result.data?.createNotification?.id) {
        alert(`Test notification created with ID: ${result.data.createNotification.id}`);
      } else {
        alert('Test failed - no notification ID returned');
      }
    } catch (error) {
      console.error('Test mutation error:', error);
      alert(`Test failed: ${error.message}`);
    }
  };

  return (
    <div className="p-4 bg-yellow-100 border border-yellow-400 rounded">
      <h3 className="font-bold">Debug: Test Notification</h3>
      <button 
        onClick={handleTest}
        className="mt-2 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
      >
        Create Test Notification
      </button>
    </div>
  );
}