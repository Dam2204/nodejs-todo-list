import express from "express";
import connect from "./schemas/index.js";
import TodosRouter from "./routes/todos.router.js";
import errorHandlerMiddleware from "./middlewares/error-handler.middleware.js";

const app = express();
const PORT = 3000;

// schemas 폴더에 있는 index.js 파일의 connect 함수를 실행하여, mongodb에 연결
connect();

// Express에서 req.body에 접근하여 body 데이터를 사용할 수 있도록 설정합니다.
// app.use는 미들웨어를 사용하게 해주는 코드로, /api 경로로 접근하는 경우에만 json 미들웨어를 거쳐 router로 연결되도록 한다.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("./assets"));

const router = express.Router();

router.get("/", (req, res) => {
  return res.json({ message: "Hi!" });
});

app.use("/api", [router, TodosRouter]);

app.use(errorHandlerMiddleware);

app.listen(PORT, () => {
  console.log(PORT, "포트로 서버가 열렸어요!");
});
