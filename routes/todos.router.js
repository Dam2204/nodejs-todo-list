// /routes/todos.router.js

import express from "express";
import Joi from "joi";
import Todo from "../schemas/todo.schemas.js";

const router = express.Router();

const createdTodoSchema = Joi.object({
  value: Joi.string().min(1).max(50).required(),
});

// 할일 등록 API //
router.post("/todos", async (req, res, next) => {
  // 1. 클라이언트로부터 받아온 value 데이터를 가져온다.
  // const { value } = req.body;
  try {
    const validation = await createdTodoSchema.validateAsync(req.body);

    const { value } = validation;

    // 1-1. 만약, 클라이언트가 value 데이터를 전달하지 않았을 경우
    if (!value) {
      return res.status(400).json({
        erroeMessage: "해야 할 일(value) 데이터가 존재하지 않습니다.",
      });
    }

    // 2. 해당하는 마지막 order 데이터를 조회한다.
    // findOne = 1개의 데이터만 조회한다.
    // sort 매개변수에 '-'를 붙여 내림차순 정렬
    // 데이터를 조회할 때, 끝에 꼭 exec를 붙여서 Promise가 실행될 때까지 await(기다리게) 해야 null값의 데이터를 받지 않는다.
    const todoMaxOrder = await Todo.findOne().sort("-order").exec();
    // 3. 만약 존재한다면 현재 해야 할 일을 +1하고, order 데이터가 존재하지 않는다면 1로 할당한다.
    const order = todoMaxOrder ? todoMaxOrder.order + 1 : 1;

    // 4. 해야 할 일 등록
    const todo = new Todo({ value, order });
    await todo.save(); // 데이터 베이스에 저장한다.

    // 5. 해야 할 일을 클라이언트에게 반환한다.
    return res.status(201).json({ todo: todo });
  } catch (error) {
    // Router 다음에 있는 에러 처리 미들웨어를 실행한다.
    next(error);
  }
});

// 해야 할 일 목록 조회 //
router.get("/todos", async (req, res, next) => {
  // 1. 해야 할 일 목록 조회를 진행한다.
  const todos = await Todo.find().sort("-order").exec();

  // 2. 해야 할 일 목록 조회 결과를 클라이언트에게 반환한다.
  return res.status(200).json({ todos });
});

// 해야 할 일 순서 변경, 완료 및 해제, 내용 변경 API //
router.patch("/todos/:todoId", async (req, res, next) => {
  const { todoId } = req.params;
  const { order, done, value } = req.body;

  // 현재 나의 order가 무엇인지 알아야한다.
  const currentTodo = await Todo.findById(todoId).exec();
  if (!currentTodo) {
    return res
      .status(404)
      .json({ errorMessage: "존재하지 않는 해야 할 일 입니다." });
  }

  if (order) {
    const targetTodo = await Todo.findOne({ order }).exec();
    if (targetTodo) {
      targetTodo.order = currentTodo.order;
      await targetTodo.save();
    }

    currentTodo.order = order;
  }

  if (done !== undefined) {
    currentTodo.doneAt = done ? new Date() : null;
  }

  if (value) {
    currentTodo.value = value;
  }

  await currentTodo.save();
  return res.status(200).json({});
});

// 해야 할 일 삭제 API //
router.delete("/todos/:todoId", async (req, res, next) => {
  const { todoId } = req.params;

  const todo = await Todo.findById(todoId).exec();
  if (!todo) {
    return res
      .status(404)
      .json({ erroeMessage: "존재하지 않는 해야 할 일 정보입니다." });
  }

  await Todo.deleteOne({ _id: todoId });

  return res.status(200).json({});
});

export default router;
