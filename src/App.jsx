import { useState, useEffect, useRef } from "react";
import { BiPlus, BiComment, BiUser, BiFace, BiSend } from "react-icons/bi";
import { IoLanguage, IoSettingsOutline } from "react-icons/io5";

import { MdHistory } from "react-icons/md";
function App() {
  const [text, setText] = useState("");
  const [message, setMessage] = useState(null);
  const [previousChats, setPreviousChats] = useState([]);
  const [currentTitle, setCurrentTitle] = useState(null);
  const [isResponseLoading, setIsResponseLoading] = useState(false);
  const [errorText, setErrorText] = useState("");
  const scrollToLastItem = useRef(null);

  const createNewChat = () => {
    setMessage(null);
    setText("");
    setCurrentTitle(null);
  };

  const backToHistoryPrompt = (uniqueTitle) => {
    setCurrentTitle(uniqueTitle);
    setMessage(null);
    setText("");
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!text) return;

    setErrorText("");
    setIsResponseLoading(true);

    const options = {
      method: "POST",
      body: JSON.stringify({
        message: text,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    };

    try {
      const response = await fetch(
        "http://localhost:8000/completions",
        options
      );
      const data = await response.json();

      if (data.error) {
        setErrorText(data.error.message);
        setText("");
      } else {
        setErrorText(false);
      }

      if (!data.error) {
        setMessage(data.choices[0].message);
        setTimeout(() => {
          scrollToLastItem.current?.lastElementChild?.scrollIntoView({
            behavior: "smooth",
          });
        }, 1);
        setTimeout(() => {
          setText("");
        }, 2);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsResponseLoading(false);
    }
  };

  useEffect(() => {
    if (!currentTitle && text && message) {
      setCurrentTitle(text);
    }

    if (currentTitle && text && message) {
      setPreviousChats((prevChats) => [
        ...prevChats,
        {
          title: currentTitle,
          role: "user",
          content: text,
        },
        {
          title: currentTitle,
          role: message.role,
          content:
            message.content.charAt(0).toUpperCase() + message.content.slice(1),
        },
      ]);
    }
  }, [message, currentTitle]);

  const currentChat = previousChats.filter(
    (prevChat) => prevChat.title === currentTitle
  );

  const uniqueTitles = Array.from(
    new Set(previousChats.map((prevChat) => prevChat.title).reverse())
  );
  return (
    <>
      <div className="container">
        <section className="sidebar">
          <div className="navbar">
          <h1>Ad Titles Input</h1>
          </div>
          <div className="company-form">
      <label className="companyName">Brand Name</label>
      <input type="text" id="companyName" placeholder="Enter Brand name" />

      <label className="description">Product/Service Description</label>
      <textarea id="description" placeholder="Enter description"></textarea>

      <label className="companyName">Keywords</label>
      <input type="text" id="companyName" placeholder="AI Writer" />

      <button type="submit" className="submit-button">Generate</button>
    </div>    
        
          

          <div className="sidebar-info">
            <div className="sidebar-info-upgrade">
              <BiUser />
              <p>Account Information</p>
            </div>
            <div className="sidebar-info-user">
              <MdHistory />
              <p>History</p>
              
            </div>
            <div className="sidebar-info-user">
              <IoLanguage/>
              <p>Language</p>
              
            </div>

            <div className="sidebar-info-user">
            <IoSettingsOutline />
              <p>Settings</p>
              
            </div>
           
          </div>
        </section>

        <section className="main">
          {!currentTitle && (
            <div className="empty-chat-container">
              
              <h1>Generating Ad Copies</h1>
            </div>
          )}

          <div className="main-header">
            <ul>
              {currentChat?.map((chatMsg, idx) => (
                <li key={idx} ref={scrollToLastItem}>
                  <img
                    src={
                      chatMsg.role === "user"
                        ? "../public/face_logo.svg"
                        : "../public/ChatGPT_logo.svg"
                    }
                    alt={chatMsg.role === "user" ? "Face icon" : "ChatGPT icon"}
                    style={{
                      backgroundColor: chatMsg.role === "user" && "#ECECF1",
                    }}
                  />
                  <p>{chatMsg.content}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="main-bottom">
            {errorText && <p className="errorText">{errorText}</p>}
            <form className="form-container" onSubmit={submitHandler}>
              <input
                type="text"
                placeholder="Send a message."
                spellCheck="false"
                value={
                  isResponseLoading
                    ? "Loading..."
                    : text.charAt(0).toUpperCase() + text.slice(1)
                }
                onChange={(e) => setText(e.target.value)}
                readOnly={isResponseLoading}
              />
              {!isResponseLoading && (
                <button type="submit">
                  <BiSend
                    size={20}
                    style={{
                      fill: text.length > 0 && "#ECECF1",
                    }}
                  />
                </button>
              )}
            </form>
            <p>
              GenAI can make mistakes. Consider checking important
              information.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}

export default App;
