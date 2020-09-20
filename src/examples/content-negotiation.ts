import * as Koa from "koa";
import * as Router from "@koa/router";
import { user } from "../models";

const app = new Koa();
const router = new Router();

app.use(async (ctx, next) => {
  const acceptableTypes = ["json", "xml"];
  if (!ctx.accepts(acceptableTypes)) {
    ctx.throw(406, `Acceptable accept types: ${acceptableTypes.join(", ")}`);
  }

  await next();

  switch (ctx.accepts(acceptableTypes)) {
    case "xml":
      const result = ctx.body;
      ctx.type = "xml";

      ctx.body = convertToXml(result);
      break;
    // Json is handled automatically with Koa
    case "json":
      break;
  }
});

const users = [
  { id: 1, age: 27, name: { first: "Jim", last: "Doe" } },
  { id: 2, age: 40, name: { first: "John", last: "Doe" } },
  { id: 3, age: 35, name: { first: "Jane", last: "Doe" } },
];

router.get("/users", (ctx) => {
  const response = users.map((user) => ({
    user,
  }));

  ctx.body = { users: response };
});

router.get("/users/:userId?", (ctx) => {
  const userId: number = ctx.params.userId;

  const user = users.find((user) => user.id == userId);

  if (user) {
    ctx.body = { user };
  } else {
    ctx.throw(404, "User not found");
  }
});

app.use(router.routes());

const port = 3000;

app.listen(port);
console.log(`Server running on http://localhost:${port}`);

function convertToXml(obj: any): string {
  let xmlString = [];

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const element = obj[key];
      xmlString.push(`<${key}>`);

      if (Array.isArray(element)) {
        xmlString.push(element.map(convertToXml).join(""));
      } else if (typeof element === "object") {
        xmlString.push(convertToXml(element));
      } else {
        xmlString.push(element);
      }
      xmlString.push(`</${key}>`);
    }
  }

  return xmlString.join("");
}
