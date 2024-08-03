export default {
  transform: {
    "^.+\\.js$": "babel-jest",
  },
  testEnvironment: "jest-environment-jsdom",
  moduleDirectories: ["node_modules", "src", "test"],
};
