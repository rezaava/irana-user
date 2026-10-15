import React from "react";
import {
  FaChevronLeft,
  FaPaperPlane,
  FaMicrophone,
  FaStop,
  FaTrash,
  FaPlay,
  FaPause,
  FaPaperclip,
  FaFile,
} from "react-icons/fa";
import { apiGet } from "../common/api";
import Loader from "../common/Loader";
import withRouter from "../common/withRouter";

const API_URL = "https://iranaserviceapp.ir/test/api";

class VoicePlayer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      playing: false,
      currentTime: 0,
      duration: Number(props.initialDuration) || 0,
    };

    this.audio = null;

    this.handlePlayPause = this.handlePlayPause.bind(this);
    this.handleTimeUpdate = this.handleTimeUpdate.bind(this);
    this.handleLoadedMetadata =
      this.handleLoadedMetadata.bind(this);
    this.handleDurationChange =
      this.handleDurationChange.bind(this);
    this.handleEnded = this.handleEnded.bind(this);
  }

  componentWillUnmount() {
    if (this.audio) {
      this.audio.pause();
    }
  }

  handlePlayPause() {
    if (!this.audio) {
      return;
    }

    if (this.audio.paused) {
      this.audio.play().catch((error) => {
        console.error("AUDIO PLAY ERROR:", error);
      });
    } else {
      this.audio.pause();
    }
  }

  handleLoadedMetadata() {
    if (!this.audio) {
      return;
    }

    const duration = this.audio.duration;

    if (Number.isFinite(duration) && duration > 0) {
      this.setState({
        duration,
      });
      return;
    }

    this.findRealDuration();
  }

  handleDurationChange() {
    if (!this.audio) {
      return;
    }

    const duration = this.audio.duration;

    if (Number.isFinite(duration) && duration > 0) {
      this.setState({
        duration,
      });
    }
  }

  findRealDuration() {
    if (!this.audio) {
      return;
    }

    const audio = this.audio;
    const oldTime = audio.currentTime;

    const handleSeeked = () => {
      const duration = audio.duration;

      if (Number.isFinite(duration) && duration > 0) {
        this.setState({
          duration,
        });

        audio.currentTime = oldTime;
      }

      audio.removeEventListener("seeked", handleSeeked);
    };

    audio.addEventListener("seeked", handleSeeked);

    try {
      audio.currentTime = 1e101;
    } catch (error) {
      audio.removeEventListener("seeked", handleSeeked);
    }
  }

  handleTimeUpdate() {
    if (!this.audio) {
      return;
    }

    const currentTime = Number.isFinite(
      this.audio.currentTime
    )
      ? this.audio.currentTime
      : 0;

    let duration = this.state.duration;

    if (
      !Number.isFinite(duration) ||
      duration <= 0
    ) {
      if (
        Number.isFinite(this.audio.duration) &&
        this.audio.duration > 0
      ) {
        duration = this.audio.duration;
      }
    }

    this.setState({
      currentTime,
      duration,
    });
  }

  handleEnded() {
    this.setState({
      playing: false,
      currentTime: 0,
    });

    if (this.audio) {
      this.audio.currentTime = 0;
    }
  }

  formatTime(seconds) {
    if (
      !Number.isFinite(seconds) ||
      seconds < 0
    ) {
      return "0:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${minutes}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  }

  renderWave() {
    const bars = [
      7, 12, 18, 10, 15, 22, 13, 8,
      19, 25, 14, 10, 20, 16, 9, 14,
      23, 12, 18, 8, 15, 21, 11, 17,
      9, 20, 14, 24, 10, 16, 8, 19,
      13, 22, 11, 17, 9, 15, 23, 12,
      18, 10, 20, 14, 8, 16, 22, 11,
      19, 13, 24, 9, 17, 12, 21, 15,
    ];

    const {
      currentTime,
      duration,
    } = this.state;

    const progress =
      duration > 0
        ? Math.min(
            100,
            (currentTime / duration) * 100
          )
        : 0;

    const isMine = this.props.isMine;

    return (
      <div
        className="d-flex align-items-center gap-1 flex-grow-1"
        style={{
          height: 34,
          overflow: "hidden",
        }}
      >
        {bars.map((height, index) => {
          const position =
            (index / bars.length) * 100;

          const active =
            position <= progress;

          return (
            <div
              key={index}
              style={{
                width: 3,
                height,
                minHeight: 5,
                borderRadius: 3,
                backgroundColor: active
                  ? isMine
                    ? "#ffffff"
                    : "#0d6efd"
                  : isMine
                  ? "rgba(255,255,255,0.45)"
                  : "#adb5bd",
                transition:
                  "background-color 0.1s linear",
                flexShrink: 0,
              }}
            />
          );
        })}
      </div>
    );
  }

  handleWaveClick = (e) => {
    if (
      !this.audio ||
      !this.state.duration
    ) {
      return;
    }

    const rect =
      e.currentTarget.getBoundingClientRect();

    const x =
      e.clientX - rect.left;

    const percentage = Math.max(
      0,
      Math.min(1, x / rect.width)
    );

    const newTime =
      percentage * this.state.duration;

    this.audio.currentTime = newTime;

    this.setState({
      currentTime: newTime,
    });
  };

  render() {
    const {
      playing,
      currentTime,
      duration,
    } = this.state;

    const isMine = this.props.isMine;

    return (
      <div
        className="d-flex align-items-center"
        style={{
          width: "100%",
          minWidth: 230,
          maxWidth: 290,
          gap: 10,
        }}
      >
        <audio
          ref={(audio) => {
            this.audio = audio;
          }}
          src={this.props.src}
          preload="metadata"
          onPlay={() =>
            this.setState({
              playing: true,
            })
          }
          onPause={() =>
            this.setState({
              playing: false,
            })
          }
          onLoadedMetadata={
            this.handleLoadedMetadata
          }
          onDurationChange={
            this.handleDurationChange
          }
          onTimeUpdate={
            this.handleTimeUpdate
          }
          onEnded={this.handleEnded}
          style={{
            display: "none",
          }}
        />

        <button
          type="button"
          onClick={this.handlePlayPause}
          className="border-0 rounded-circle d-flex align-items-center justify-content-center"
          style={{
            width: 42,
            height: 42,
            minWidth: 42,
            backgroundColor: isMine
              ? "#ffffff"
              : "#0d6efd",
            color: isMine
              ? "#0d6efd"
              : "#ffffff",
            cursor: "pointer",
          }}
        >
          {playing ? (
            <FaPause size={14} />
          ) : (
            <FaPlay
              size={14}
              style={{
                marginRight: -2,
              }}
            />
          )}
        </button>

        <div
          className="d-flex flex-column flex-grow-1"
          style={{
            minWidth: 0,
          }}
        >
          <div
            className="d-flex align-items-center"
            onClick={this.handleWaveClick}
            style={{
              cursor: duration
                ? "pointer"
                : "default",
            }}
          >
            {this.renderWave()}
          </div>

          <div
            className="d-flex justify-content-between align-items-center"
            style={{
              marginTop: 1,
            }}
          >
            <span
              style={{
                fontSize: 11,
                color: isMine
                  ? "rgba(255,255,255,0.8)"
                  : "#6c757d",
              }}
            >
              {this.formatTime(currentTime)}
            </span>

            <span
              style={{
                fontSize: 11,
                color: isMine
                  ? "rgba(255,255,255,0.8)"
                  : "#6c757d",
              }}
            >
              {this.formatTime(duration)}
            </span>
          </div>
        </div>
      </div>
    );
  }
}

class ChatSupportPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      messages: [],
      text: "",
      loading: true,
      sending: false,
      recording: false,
      audioUrl: null,
      audioDuration: 0,
      recordingTime: 0,
      selectedFile: null,
    };

    this.mediaRecorder = null;
    this.audioChunks = [];
    this.audioStream = null;
    this.audioBlob = null;
    this.timer = null;
    this.fileInput = null;

    this.handleBack =
      this.handleBack.bind(this);

    this.handleTextChange =
      this.handleTextChange.bind(this);

    this.handleSend =
      this.handleSend.bind(this);

    this.startRecording =
      this.startRecording.bind(this);

    this.stopRecording =
      this.stopRecording.bind(this);

    this.cancelRecording =
      this.cancelRecording.bind(this);

    this.sendVoice =
      this.sendVoice.bind(this);

    this.handleFileChange =
      this.handleFileChange.bind(this);

    this.removeSelectedFile =
      this.removeSelectedFile.bind(this);
  }

  componentDidMount() {
    this.previousBodyMargin =
      document.body.style.margin;

    this.previousBodyPadding =
      document.body.style.padding;

    this.previousBodyOverflow =
      document.body.style.overflow;

    this.previousBodyHeight =
      document.body.style.height;

    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.overflow = "hidden";
    document.body.style.height = "100dvh";

    const navOuter =
      document.querySelector(".nav-outer");

    if (navOuter) {
      this.previousNavOuterDisplay =
        navOuter.style.display;

      navOuter.style.display = "none";
    }

    this.loadMessages();
  }

  componentWillUnmount() {
    this.stopTimer();

    if (this.audioStream) {
      this.audioStream
        .getTracks()
        .forEach((track) => {
          track.stop();
        });
    }

    if (this.state.audioUrl) {
      URL.revokeObjectURL(
        this.state.audioUrl
      );
    }

    const navOuter =
      document.querySelector(".nav-outer");

    if (navOuter) {
      navOuter.style.display =
        this.previousNavOuterDisplay || "";
    }

    document.body.style.margin =
      this.previousBodyMargin || "";

    document.body.style.padding =
      this.previousBodyPadding || "";

    document.body.style.overflow =
      this.previousBodyOverflow || "";

    document.body.style.height =
      this.previousBodyHeight || "";
  }

  loadMessages() {
    apiGet("/messages")
      .then((json) => {
        this.setState({
          messages: json.messages || [],
          loading: false,
        });
      })
      .catch((error) => {
        console.error(
          "MESSAGES ERROR:",
          error
        );

        this.setState({
          loading: false,
        });
      });
  }

  handleBack() {
    this.props.navigate(-1);
  }

  handleTextChange(e) {
    this.setState({
      text: e.target.value,
    });
  }

  handleFileChange(e) {
    const file =
      e.target.files &&
      e.target.files[0];

    if (!file) {
      return;
    }

    this.setState({
      selectedFile: file,
    });

    e.target.value = "";
  }

  removeSelectedFile() {
    this.setState({
      selectedFile: null,
    });
  }

  handleSend(e) {
    e.preventDefault();

    const {
      text,
      selectedFile,
    } = this.state;

    if (
      !text.trim() &&
      !selectedFile
    ) {
      return;
    }

    const token =
      localStorage.getItem("token");

    this.setState({
      sending: true,
    });

    const formData = new FormData();

    formData.append(
      "text",
      text.trim()
    );

    if (selectedFile) {
      formData.append(
        "file",
        selectedFile,
        selectedFile.name
      );

      formData.append(
        "size",
        selectedFile.size
      );

      formData.append(
        "hash",
        ""
      );
    }

    fetch(`${API_URL}/messages`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })
      .then((response) =>
        response.json()
      )
      .then((data) => {
        if (data.status !== "1") {
          throw new Error(
            data.message ||
              "ارسال پیام انجام نشد."
          );
        }

        this.setState({
          sending: false,
          text: "",
          selectedFile: null,
        });

        this.loadMessages();
      })
      .catch((error) => {
        console.error(
          "SEND MESSAGE ERROR:",
          error
        );

        this.setState({
          sending: false,
        });

        alert(
          "ارسال پیام انجام نشد."
        );
      });
  }

  async startRecording() {
    try {
      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices
          .getUserMedia
      ) {
        alert(
          "مرورگر شما از ضبط صدا پشتیبانی نمی‌کند."
        );

        return;
      }

      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

      this.audioStream = stream;
      this.audioChunks = [];
      this.audioBlob = null;

      let mimeType = "audio/webm";

      if (
        !MediaRecorder.isTypeSupported(
          "audio/webm"
        )
      ) {
        if (
          MediaRecorder.isTypeSupported(
            "audio/mp4"
          )
        ) {
          mimeType = "audio/mp4";
        } else if (
          MediaRecorder.isTypeSupported(
            "audio/ogg"
          )
        ) {
          mimeType = "audio/ogg";
        } else {
          mimeType = "";
        }
      }

      this.mediaRecorder = mimeType
        ? new MediaRecorder(stream, {
            mimeType,
          })
        : new MediaRecorder(stream);

      this.mediaRecorder.ondataavailable =
        (event) => {
          if (
            event.data &&
            event.data.size > 0
          ) {
            this.audioChunks.push(
              event.data
            );
          }
        };

      this.mediaRecorder.onstop = () => {
        const actualMimeType =
          this.mediaRecorder.mimeType ||
          mimeType ||
          "audio/webm";

        const audioBlob = new Blob(
          this.audioChunks,
          {
            type: actualMimeType,
          }
        );

        const audioUrl =
          URL.createObjectURL(
            audioBlob
          );

        const duration =
          this.state.recordingTime;

        this.audioBlob = audioBlob;

        this.setState({
          recording: false,
          audioUrl,
          audioDuration: duration,
          recordingTime: 0,
        });

        if (this.audioStream) {
          this.audioStream
            .getTracks()
            .forEach((track) =>
              track.stop()
            );

          this.audioStream = null;
        }

        this.stopTimer();
      };

      this.mediaRecorder.start();

      this.setState({
        recording: true,
        recordingTime: 0,
        audioUrl: null,
        audioDuration: 0,
      });

      this.startTimer();
    } catch (error) {
      console.error(
        "RECORDING ERROR:",
        error
      );

      alert(
        "دسترسی به میکروفون داده نشد. لطفاً اجازه استفاده از میکروفون را فعال کنید."
      );
    }
  }

  stopRecording() {
    if (
      this.mediaRecorder &&
      this.mediaRecorder.state !==
        "inactive"
    ) {
      this.mediaRecorder.stop();
    }
  }

  cancelRecording() {
    if (
      this.mediaRecorder &&
      this.mediaRecorder.state !==
        "inactive"
    ) {
      this.mediaRecorder.ondataavailable =
        null;

      this.mediaRecorder.onstop = null;

      this.mediaRecorder.stop();
    }

    if (this.audioStream) {
      this.audioStream
        .getTracks()
        .forEach((track) =>
          track.stop()
        );

      this.audioStream = null;
    }

    this.stopTimer();

    if (this.state.audioUrl) {
      URL.revokeObjectURL(
        this.state.audioUrl
      );
    }

    this.audioChunks = [];
    this.audioBlob = null;

    this.setState({
      recording: false,
      audioUrl: null,
      audioDuration: 0,
      recordingTime: 0,
    });
  }

  startTimer() {
    this.stopTimer();

    this.timer = setInterval(() => {
      this.setState(
        (prevState) => ({
          recordingTime:
            prevState.recordingTime + 1,
        })
      );
    }, 1000);
  }

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  formatTime(seconds) {
    if (
      !Number.isFinite(seconds) ||
      seconds < 0
    ) {
      return "00:00";
    }

    const minutes = Math.floor(
      seconds / 60
    );

    const remainingSeconds =
      Math.floor(seconds % 60);

    return `${String(minutes).padStart(
      2,
      "0"
    )}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  }

  sendVoice() {
    if (!this.audioBlob) {
      return;
    }

    const token =
      localStorage.getItem("token");

    this.setState({
      sending: true,
    });

    const formData = new FormData();

    let extension = "webm";

    if (
      this.audioBlob.type.includes("mp4")
    ) {
      extension = "mp4";
    } else if (
      this.audioBlob.type.includes("ogg")
    ) {
      extension = "ogg";
    }

    const fileName = `voice_${Date.now()}.${extension}`;

    formData.append(
      "file",
      this.audioBlob,
      fileName
    );

    formData.append("text", "");
    formData.append("hash", "");

    formData.append(
      "size",
      this.audioBlob.size
    );

    fetch(`${API_URL}/messages`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })
      .then((response) =>
        response.json()
      )
      .then((data) => {
        if (data.status !== "1") {
          throw new Error(
            data.message ||
              "ارسال ویس انجام نشد."
          );
        }

        if (this.state.audioUrl) {
          URL.revokeObjectURL(
            this.state.audioUrl
          );
        }

        this.audioBlob = null;

        this.setState({
          sending: false,
          audioUrl: null,
          audioDuration: 0,
          recordingTime: 0,
        });

        this.loadMessages();
      })
      .catch((error) => {
        console.error(
          "SEND VOICE ERROR:",
          error
        );

        this.setState({
          sending: false,
        });

        alert(
          "ارسال ویس انجام نشد."
        );
      });
  }

  getFileUrl(file) {
    if (!file) {
      return "";
    }

    if (
      file.startsWith("http://") ||
      file.startsWith("https://")
    ) {
      return file;
    }

    return `${API_URL.replace(
      "/api",
      ""
    )}/files/chats${file}`;
  }

  getFileName(file) {
    if (!file) {
      return "فایل";
    }

    const parts = file.split("/");

    return (
      parts[parts.length - 1] ||
      "فایل"
    );
  }

  formatFileSize(size) {
    if (!size) {
      return "0 KB";
    }

    if (size < 1024) {
      return `${size} B`;
    }

    if (size < 1024 * 1024) {
      return `${(
        size / 1024
      ).toFixed(1)} KB`;
    }

    return `${(
      size /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  }

  renderMessage(message) {
    const hasFile = !!message.file;
    const hasText = !!message.text;

    const fileName =
      this.getFileName(
        message.file
      );

    const fileUrl =
      this.getFileUrl(
        message.file
      );

    const isAudio =
      /\.(webm|mp3|wav|ogg|m4a|mp4)$/i.test(
        fileName
      );

    const currentUserId = Number(
      localStorage.getItem("user_id")
    );

    const isMine =
      Number(message.sender_id) ===
      currentUserId;

    return (
      <div
        key={message.id}
        className="mb-3"
        style={{
          textAlign: isMine
            ? "left"
            : "right",
        }}
      >
        <div
          className="d-inline-flex flex-column rounded-3 px-3 py-2"
          style={{
            maxWidth: "85%",
            minWidth: hasFile
              ? 260
              : "auto",
            backgroundColor: isMine
              ? "#0d6efd"
              : "#f8f9fa",
            color: isMine
              ? "#ffffff"
              : "#212529",
            textAlign: "right",
          }}
        >
          {hasFile && isAudio && (
            <VoicePlayer
              src={fileUrl}
              isMine={isMine}
            />
          )}

          {hasFile && !isAudio && (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-decoration-none"
              style={{
                color: "inherit",
              }}
            >
              <div
                className="d-flex align-items-center gap-2"
                style={{
                  minWidth: 220,
                  maxWidth: 280,
                }}
              >
                <div
                  className="rounded-circle bg-white d-flex align-items-center justify-content-center"
                  style={{
                    width: 42,
                    height: 42,
                    flexShrink: 0,
                  }}
                >
                  <FaFile
                    className="text-primary"
                    size={17}
                  />
                </div>

                <div
                  className="d-flex flex-column text-end"
                  style={{
                    minWidth: 0,
                  }}
                >
                  <span
                    className="fw-semibold"
                    style={{
                      fontSize: 13,
                      wordBreak:
                        "break-word",
                      color: isMine
                        ? "#ffffff"
                        : "#212529",
                    }}
                  >
                    {fileName}
                  </span>

                  <span
                    style={{
                      fontSize: 11,
                      color: isMine
                        ? "rgba(255,255,255,0.75)"
                        : "#6c757d",
                    }}
                  >
                    دانلود فایل
                  </span>
                </div>
              </div>
            </a>
          )}

          {hasText && (
            <div
              className="mt-1"
              style={{
                wordBreak:
                  "break-word",
                color: isMine
                  ? "#ffffff"
                  : "#212529",
              }}
            >
              {message.text}
            </div>
          )}
        </div>
      </div>
    );
  }

  render() {
    const {
      messages,
      text,
      loading,
      sending,
      recording,
      audioUrl,
      audioDuration,
      recordingTime,
      selectedFile,
    } = this.state;

    return (
      <div
        className="bg-white d-flex flex-column"
        style={{
          height: "100dvh",
          maxHeight: "100dvh",
          overflow: "hidden",
          width: "100%",
        }}
      >
        {loading && <Loader />}

        <div
          className="d-flex align-items-center justify-content-between px-3 pt-4 pb-3 border-bottom"
          style={{
            maxWidth: 480,
            margin: "0 auto",
            width: "100%",
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={this.handleBack}
            className="btn btn-light rounded-circle border p-2 d-flex align-items-center justify-content-center"
            style={{
              width: 36,
              height: 36,
            }}
          >
            <FaChevronLeft size={14} />
          </button>

          <h1 className="fs-6 fw-semibold text-dark m-0">
            پشتیبانی
          </h1>

          <div
            style={{
              width: 36,
            }}
          />
        </div>

        <div
          className="flex-grow-1 px-3 py-3"
          style={{
            maxWidth: 480,
            margin: "0 auto",
            width: "100%",
            minHeight: 0,
            overflowY: "auto",
            overflowX: "hidden",
            overscrollBehavior: "contain",
          }}
        >
          {messages.length === 0 &&
          !loading ? (
            <div className="text-center text-muted py-5">
              هنوز پیامی وجود ندارد.
            </div>
          ) : (
            messages.map((message) =>
              this.renderMessage(message)
            )
          )}
        </div>

        {selectedFile &&
          !recording &&
          !audioUrl && (
            <div
              className="px-3 pb-2"
              style={{
                maxWidth: 480,
                margin: "0 auto",
                width: "100%",
                flexShrink: 0,
              }}
            >
              <div className="border rounded-4 px-3 py-2 bg-light d-flex align-items-center gap-2">
                <div
                  className="rounded-circle bg-white d-flex align-items-center justify-content-center"
                  style={{
                    width: 38,
                    height: 38,
                    flexShrink: 0,
                  }}
                >
                  <FaFile
                    className="text-primary"
                    size={15}
                  />
                </div>

                <div
                  className="flex-grow-1 text-end"
                  style={{
                    minWidth: 0,
                  }}
                >
                  <div
                    className="text-dark fw-semibold"
                    style={{
                      fontSize: 13,
                      overflow: "hidden",
                      textOverflow:
                        "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {selectedFile.name}
                  </div>

                  <div
                    className="text-muted"
                    style={{
                      fontSize: 11,
                    }}
                  >
                    {this.formatFileSize(
                      selectedFile.size
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={
                    this.removeSelectedFile
                  }
                  disabled={sending}
                  className="btn btn-light text-danger rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: 34,
                    height: 34,
                    flexShrink: 0,
                  }}
                >
                  <FaTrash size={13} />
                </button>
              </div>
            </div>
          )}

        {audioUrl && !recording && (
          <div
            className="px-3 pb-2"
            style={{
              maxWidth: 480,
              margin: "0 auto",
              width: "100%",
              flexShrink: 0,
            }}
          >
            <div
              className="border rounded-4 p-2 d-flex align-items-center gap-2"
              style={{
                backgroundColor: "#f8f9fa",
              }}
            >
              <div
                className="flex-grow-1"
                style={{
                  minWidth: 0,
                }}
              >
                <VoicePlayer
                  src={audioUrl}
                  initialDuration={
                    audioDuration
                  }
                />
              </div>

              <button
                type="button"
                onClick={
                  this.cancelRecording
                }
                disabled={sending}
                className="btn btn-light text-danger rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: 40,
                  height: 40,
                  flexShrink: 0,
                }}
              >
                <FaTrash size={14} />
              </button>

              <button
                type="button"
                onClick={this.sendVoice}
                disabled={sending}
                className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: 40,
                  height: 40,
                  flexShrink: 0,
                }}
              >
                <FaPaperPlane size={14} />
              </button>
            </div>
          </div>
        )}

        {!recording && !audioUrl && (
          <form
            onSubmit={this.handleSend}
            className="d-flex align-items-center gap-2 px-3 py-3 border-top"
            style={{
              maxWidth: 480,
              margin: "0 auto",
              width: "100%",
              flexShrink: 0,
            }}
          >
            <input
              ref={(input) => {
                this.fileInput = input;
              }}
              type="file"
              onChange={this.handleFileChange}
              style={{
                display: "none",
              }}
            />

            <button
              type="button"
              onClick={() => {
                if (this.fileInput) {
                  this.fileInput.click();
                }
              }}
              disabled={sending}
              className="btn btn-light border rounded-circle p-2 d-flex align-items-center justify-content-center"
              style={{
                width: 40,
                height: 40,
                flexShrink: 0,
              }}
              title="انتخاب فایل"
            >
              <FaPaperclip size={16} />
            </button>

            <button
              type="button"
              onClick={this.startRecording}
              disabled={sending}
              className="btn btn-light border rounded-circle p-2 d-flex align-items-center justify-content-center"
              style={{
                width: 40,
                height: 40,
                flexShrink: 0,
              }}
              title="ضبط صدا"
            >
              <FaMicrophone size={16} />
            </button>

            <input
              type="text"
              placeholder="پیام خود را بنویسید..."
              value={text}
              onChange={this.handleTextChange}
              className="form-control border rounded-pill text-end px-3 py-2"
            />

            <button
              type="submit"
              disabled={
                sending ||
                (!text.trim() &&
                  !selectedFile)
              }
              className="btn btn-primary rounded-circle p-2 d-flex align-items-center justify-content-center"
              style={{
                width: 40,
                height: 40,
                flexShrink: 0,
              }}
            >
              <FaPaperPlane size={14} />
            </button>
          </form>
        )}

        {recording && (
          <div
            className="px-3 py-3 border-top"
            style={{
              maxWidth: 480,
              margin: "0 auto",
              width: "100%",
              flexShrink: 0,
            }}
          >
            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                onClick={this.cancelRecording}
                className="btn btn-light text-danger border rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: 40,
                  height: 40,
                  flexShrink: 0,
                }}
              >
                <FaTrash size={14} />
              </button>

              <div className="flex-grow-1 bg-light rounded-pill px-3 py-2 d-flex align-items-center justify-content-between">
                <span className="text-danger fw-semibold">
                  ● در حال ضبط
                </span>

                <span className="text-dark">
                  {this.formatTime(
                    recordingTime
                  )}
                </span>
              </div>

              <button
                type="button"
                onClick={this.stopRecording}
                className="btn btn-danger rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: 40,
                  height: 40,
                  flexShrink: 0,
                }}
              >
                <FaStop size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default withRouter(
  ChatSupportPage
);