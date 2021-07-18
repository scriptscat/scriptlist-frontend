import Vue from "vue";
import { get, post } from "../utils/axios"; // 二次封裝axios.js
Vue.prototype.get = get; // 設置全局GET方法
Vue.prototype.post = post; // 設置全局POST提交方法
Vue.filter("formatDate", function(value) {
  if (value.toString().length === 10) {
    value = value * 1000;
  }
  let date = new Date(value);
  let y = date.getFullYear();
  let MM = date.getMonth() + 1;
  MM = MM < 10 ? "0" + MM : MM;
  let d = date.getDate();
  d = d < 10 ? "0" + d : d;
  let h = date.getHours();
  h = h < 10 ? "0" + h : h;
  let m = date.getMinutes();
  m = m < 10 ? "0" + m : m;
  let s = date.getSeconds();
  s = s < 10 ? "0" + s : s;
  return y + "-" + MM + "-" + d;
});
console.log("enc", process.env.VUE_APP_HTTP_HOST);
