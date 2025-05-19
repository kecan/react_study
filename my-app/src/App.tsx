import React, { useState } from "react";
import { MastraClient } from "@mastra/client-js";

// 创建 Mastra 客户端实例
const client = new MastraClient({
  // Required
  baseUrl: "https://code-review-agent.kecan199411.workers.dev",
  // Optional configurations for development
  retries: 3, // 重试次数
  backoffMs: 300, // 初始重试等待时间
  maxBackoffMs: 5000, // 最大重试等待时间
});

// 获取代码审查代理实例
const codeReviewAgent = client.getAgent("codeReviewAgent");

// 定义消息类型
interface Message {
  text: string;
  sender: "user" | "ai";
}

const ChatApp: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]); // 消息列表
  const [userInput, setUserInput] = useState<string>(""); // 用户输入
  const [loading, setLoading] = useState<boolean>(false); // 加载状态

  // 处理输入框内容变化
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserInput(e.target.value);
  };

  // 发送消息
  const handleSendMessage = async () => {
    if (!userInput.trim()) return;
    // 用户消息
    const userMessage: Message = { text: userInput, sender: "user" };
    try {
      setLoading(true);
      const response = await codeReviewAgent.generate({
        messages: [
          {
            role: "user",
            content: userInput,
          },
        ],
      });
      console.log("response-----", response);
      const aiMessage: Message = { text: response.text, sender: "ai" };
      setMessages([...messages, userMessage, aiMessage]);
    } catch (error) {
      console.error("API 请求失败:", error);
    } finally {
      setLoading(false);
    }

    setUserInput("");
  };

  // 将文本中的 \n 转换为 <br />
  const formatText = (text: string) => {
    return text.split("\n").map((str, index) => (
      <span key={index}>
        {str}
        <br />
      </span>
    ));
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 页面标题 */}
      <div
        style={{
          textAlign: "center",
          padding: "20px",
          fontSize: "24px",
          fontWeight: "bold",
          backgroundColor: "#f8f9fa",
        }}
      >
        代码审查助手
      </div>

      {/* 上半部分: 显示对话内容 */}
      <div
        style={{
          flex: 1,
          overflowY: "scroll",
          padding: "10px",
          backgroundColor: "#f0f0f0",
        }}
      >
        {messages.map((message, index) => (
          <div
            key={index}
            style={{
              textAlign: message.sender === "user" ? "right" : "left",
              margin: "10px",
            }}
          >
            <div
              style={{
                display: "inline-block",
                padding: "10px",
                borderRadius: "8px",
                backgroundColor:
                  message.sender === "user" ? "#d1e7ff" : "#e1e1e1",
                maxWidth: "60%",
              }}
            >
              {message.sender === "ai"
                ? formatText(message.text)
                : message.text}
            </div>
          </div>
        ))}
      </div>

      {/* 下半部分: 输入框和发送按钮 */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "10px",
          backgroundColor: "#fff",
        }}
      >
        <textarea
          value={userInput}
          onChange={handleInputChange}
          placeholder="请输入代码进行审查"
          style={{
            height: "100px", // 设置为 5 行的高度
            resize: "none", // 禁止缩放
            padding: "10px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            fontSize: "16px",
            marginBottom: "10px",
            fontFamily: "monospace", // 使用等宽字体更适合代码输入
          }}
        />
        <button
          onClick={handleSendMessage}
          style={{
            padding: "10px 20px",
            borderRadius: "5px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          {loading ? "加载中..." : "发送"}
        </button>
      </div>

      {/* 加载提示 */}
      {loading && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: "20px",
            color: "#007bff",
          }}
        >
          正在处理中...
        </div>
      )}
    </div>
  );
};

export default ChatApp;
