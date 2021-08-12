# [消費者資訊紀錄系統](https://www.inforecord.me/)  
![](https://user-images.githubusercontent.com/52588493/129036789-b6fd4137-fe86-4242-95a4-d1fec64a4ca6.png)  

## 資料庫設計  
![](https://user-images.githubusercontent.com/52588493/128443496-9e336f0a-02df-4bb5-b498-f9ada516b77d.png)  

## 使用技術
- Frontend: HTML, css, JavaScript ( RWD ), AJAX  
- Backend: Python ( Flask, Pandas )  
- Database: MySQL  
- Amazon Web Service: EC2, S3, CloudFront    
- Nginx
- Google Charts  
##  

網站提供有展覽需求之公司，於會場記錄在什麼展覽、銷售什麼商品、給什麼對象，輔以圖表將銷量視覺化，並可將資料以 excel 格式匯出。佈署於雲端伺服器 AWS EC2，將使用者與訂單資訊儲存於 EC2 上之 MySQL 中，圖片上傳至 S3 搭配 CloudFront 的 CDN 服務取得連結，採 RESTful API 架構取得所需資料。  

網址：[https://www.inforecord.me/](https://www.inforecord.me/)  
測試公司：company  
測試信箱：admin@admin.com  
測試密碼：admin  

## 頁面概觀
主要功能畫面  
![主要功能畫面](https://user-images.githubusercontent.com/52588493/129039021-6b95565f-4750-4708-8b07-39ab6bacad2b.png)  

銷量視覺化頁面
![銷量視覺化頁面](https://user-images.githubusercontent.com/52588493/129039008-0d37e884-5c54-4be5-80f0-cf7f794e057b.png) 

