// src/shared/Messages.tsx

import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Layout,
  List,
  Typography,
  Spin,
  Empty,
  Descriptions,
} from 'antd';
import { MailOutlined } from '@ant-design/icons';

const { Sider, Content } = Layout;
const { Title, Text } = Typography;

interface Message {
  id: string;
  from: string;
  fromName: string;
  fromRole: string;
  to: string;
  subject: string;
  content: string;
  date: string;
}

interface MessagesProps {
  userEmail: string;
  userRole?: string;
}

const baseURL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://backend-greenpark.onrender.com";
    
const Messages: React.FC<MessagesProps> = ({ userEmail }) => {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(`${baseURL}/api/mensajes?correo=${userEmail}`);
        setMessages(res.data);
      } catch (error) {
        console.error('Error al obtener mensajes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [userEmail]);

  return (
    <Layout
      className="rounded-lg shadow border overflow-hidden"
      style={{ height: 'calc(100vh - 120px)', background: '#fff' }}
    >
      {/* Bandeja lateral */}
      <Sider
        width={320}
        style={{
          background: '#fff',
          borderRight: '1px solid #f0f0f0',
          overflowY: 'auto',
          padding: '16px 0',
        }}
      >
        <div
          style={{
            padding: '0 24px',
            marginBottom: 12,
            position: 'sticky',
            top: 0,
            zIndex: 1,
            background: '#fff',
          }}
        >
          <Title level={4} style={{ margin: 0, color: '#1A3D33' }}>
            <MailOutlined style={{ marginRight: 8 }} />
            Bandeja de entrada
          </Title>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-full p-4">
            <Spin />
          </div>
        ) : messages.length === 0 ? (
          <Empty description="No hay mensajes" className="mt-8" />
        ) : (
          <List
            dataSource={messages}
            itemLayout="vertical"
            style={{ padding: '0 8px' }}
            renderItem={(msg) => (
              <List.Item
                onClick={() => setSelectedMessage(msg)}
                style={{
                  cursor: 'pointer',
                  padding: '12px 16px',
                  marginBottom: 8,
                  borderRadius: 8,
                  backgroundColor:
                    selectedMessage?.id === msg.id ? '#f0f5f1' : '#fafafa',
                  border:
                    selectedMessage?.id === msg.id
                      ? '1px solid #8BAE52'
                      : '1px solid #f0f0f0',
                  transition: 'all 0.2s ease',
                }}
                className="hover:shadow-sm hover:bg-[#f5f9f6]"
              >
                <div className="font-semibold text-[#1A3D33]">
                  {msg.fromName}{' '}
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    ({msg.fromRole})
                  </Text>
                </div>
                <div className="text-sm font-medium text-gray-700 truncate">
                  {msg.subject}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(msg.date).toLocaleString()}
                </div>
              </List.Item>
            )}
          />
        )}
      </Sider>

      {/* Panel del mensaje */}
      <Content style={{ padding: '24px', overflowY: 'auto' }}>
        {selectedMessage ? (
          <>
            <Title level={3} style={{ color: '#1A3D33' }}>
              {selectedMessage.subject}
            </Title>
            <Descriptions
              bordered
              size="small"
              column={1}
              style={{ marginBottom: 24 }}
              labelStyle={{ fontWeight: 600 }}
            >
              <Descriptions.Item label="De">
                {selectedMessage.fromName} ({selectedMessage.from})
              </Descriptions.Item>
              <Descriptions.Item label="Rol">
                {selectedMessage.fromRole}
              </Descriptions.Item>
              <Descriptions.Item label="Recibido">
                {new Date(selectedMessage.date).toLocaleString()}
              </Descriptions.Item>
            </Descriptions>

            <div
              style={{
                whiteSpace: 'pre-wrap',
                fontSize: 16,
                color: '#333',
                lineHeight: 1.6,
              }}
            >
              {selectedMessage.content}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            Selecciona un mensaje para ver su contenido.
          </div>
        )}
      </Content>
    </Layout>
  );
};

export default Messages;
