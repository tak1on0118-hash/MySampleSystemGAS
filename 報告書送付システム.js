function dailyReportSendSystem(){
  //date情報
  const date = new Date();
  const new_date = Utilities.formatDate(date, "Asia/Tokyo", "yyyy/MM/dd HH:mm:ss");

  //汎用報告書フォーマットのスプレッドシート情報
  const form_ID = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_FORM_ID") || "YOUR_SPREADSHEET_FORM_ID";
  const form_sheetName = 'フォームの回答';

  //報告書レイアウトのスプレッドシート情報
  const layout_ID =  PropertiesService.getScriptProperties().getProperty("SPREADSHEET_LAYOUT_ID") || "YOUR_SPREADSHEET_LAYOUT_ID";

  //メールパラメータ
  const address = "gtrevenge2@gmail.com";
  //const address = "your_email@sample.com"

  console.log("初期値");
  console.log(form_ID);

 
  //IDを指定してスプリットシート,'フォーム回答'シートを取得
  const form_ss = SpreadsheetApp.openById(form_ID);
  const form_sheet = form_ss.getSheetByName(form_sheetName);

  
  //シート’フォームの回答’の行数および列数を数える
  const form_lastRow = form_sheet.getLastRow();
  const form_lastCol = form_sheet.getLastColumn();
  
  console.log("行数は" + form_lastRow);
  console.log("列数は" + form_lastCol);

  //タイプスタンプを基準にソート(2行目から最終行まで)
  if(form_lastRow > 1){
    form_sheet.getRange(2, 1, form_lastRow - 1, form_lastCol).sort({column: 1, ascending: true});
  }

  //報告内容:14行目　特記事項：15行目　それぞれを取得
  const content_Num = 14;
  const special_Num = 15;
  const report_content = form_sheet.getRange(form_lastRow , content_Num).getDisplayValue();
  const report_special = form_sheet.getRange(form_lastRow , special_Num).getDisplayValue();

  console.log("報告内容は" + report_content);
  
  //報告内容が書かれていた場合に要約、報告内容が空だった場合に特記事項を要約部分に書き込む
  if(report_content != "")
  {
    summarizeOnSubmit(form_sheet, form_lastRow);
  } else {
    form_sheet.getRange(form_lastRow , form_lastCol).setValue(report_special);
  }


  //配列で取得(最終行、1列、1行分、列数)
  const all_data = form_sheet.getRange(form_lastRow, 1, 1, form_lastCol).getDisplayValues();
  console.log(all_data);

  //レイアウトからコピーして報告書ファイルを作成
  const layout = DriveApp.getFileById(layout_ID); 
  let lay_cpy = layout.makeCopy("一時ファイル");
  let lay_cpy_ID = lay_cpy.getId();
  let lay_cpy_ss = SpreadsheetApp.openById(lay_cpy_ID);
  const write_Name = '転記先';
  const report_Name = '報告書①';
  
  //報告書コピーに抽出したデータを書き込む
  let lay_write_sheet = lay_cpy_ss.getSheetByName(write_Name);
  lay_write_sheet.getRange(2,1,1,form_lastCol).setValues(all_data); //書き込む

  //"報告書①"を数式=>値に変換
  let report_sheet = lay_cpy_ss.getSheetByName(report_Name); 
  //最終行・列を取得
  let report_lastRow = report_sheet.getLastRow();
  let report_lastCol = report_sheet.getLastColumn();

  console.log("行数は" + report_lastRow);
  console.log("列数は" + report_lastCol);

  //全範囲を取得
  let report_range = report_sheet.getRange(1, 1, report_lastRow, report_lastCol);
  //値貼り
  report_range.copyTo(report_range,{contentsOnly:true});

  //状況の更新
  SpreadsheetApp.flush();

  //コピーしたスプレッドシートを"報告書①"のみにする
  let cnt = lay_cpy_ss.getNumSheets(); //アクティブなスプレッドシートのシート数を取得
  lay_write_sheet.activate();
  lay_cpy_ss.moveActiveSheet(cnt); //アクティブシートを1番右へ移動
  
  for(var i = cnt; i >= 2; i--){ //一番左に配置されているシート（報告書①）以外削除
    var sh = lay_cpy_ss.getSheets()[i-1]; 
    lay_cpy_ss.deleteSheet(sh); //シート削除
  }

  //文字数に応じて、欄の調整
  lay_cpy = DriveApp.getFileById(layout_ID);
  lay_cpy_ss = SpreadsheetApp.openById(lay_cpy_ID);
  report_sheet = lay_cpy_ss.getSheetByName(report_Name);

  //報告内容18行目　特記事項170行目
  let con_text = report_sheet.getRange(18,2).getDisplayValue(); 
  let sp_text = report_sheet.getRange(170,2).getDisplayValue();
  
  //空白行の削除
  con_text =  con_text.replace(/\n{2,}/g, "\n").trim();
  sp_text = sp_text.replace(/\n{2,}/g, "\n").trim();
  report_sheet.getRange(18,2).setValue(con_text);
  report_sheet.getRange(170,2).setValue(sp_text);
  
  //改行分を削除
  let con_text_del = con_text.replace(/\n/g,"").trim();
  let sp_text_del = sp_text.replace(/\n/g,"").trim(); 

  //空白行削除分-改行分削除で改行数を取得
  let con_break = con_text.length - con_text_del.length; //報告内容部分の改行数
  let sp_break = sp_text.length - sp_text_del.length; //特記事項部分の改行数

  console.log("報告内容は" + con_text_del) ; 
  console.log("改行数は" + con_break);

  let  check = false;

// 一行45文字＋改行数で計算。7行を超える場合とそうでない場合で削除する行数を変更
  if(sp_text_del.length / 45 +  sp_break > 7)
  { 
    let sp_text_plus = sp_text.length - 315; //改行の多発により文字数が満たない場合の考慮
    if(sp_text_plus < 0)
    {
      sp_text_plus = 0;
    }
    const del_count = Math.floor(sp_text_plus / 45) + sp_break;
    report_sheet.deleteRows(177 + del_count, 25 - del_count);
    check = true;
  } else {
    report_sheet.deleteRows(177,25);
  }
  
// 一行45文字＋改行数で計算。25行を超える場合とそうでない場合で削除する行数を変更
  if(con_text_del.length / 45 + con_break > 25)
  {
    if(con_text_del.length / 45 + con_break <= 45)
    {
      report_sheet.deleteRows(61,106);
    } else {
      let con_text_plus = con_text.length - 2025; //改行の多発により文字数が満たない場合の考慮
      if(con_text_plus < 0)
      {
        con_text_plus = 0;
      }
      const del_count2 = Math.floor(con_text_plus / 45) + con_break; 
      report_sheet.deleteRows(61 + del_count2 ,106 - del_count2);
    }
  } else if (check){
      report_sheet.deleteRows(61,106);
  } else {
      report_sheet.deleteRows(42,124);
  }

　//スプレッドシートをリネーム

  const exe_User = all_data[0][2];
  const exe_No = all_data[0][3];
  const exe_Date = all_data[0][4];
  lay_cpy_ss.rename(exe_Date + "(" + exe_User + ")" + exe_No);

  //識別番号のフォルダを作成
  //すでに存在すれば作成しない
  const root = DriveApp.getRootFolder();
  const root_folder = folderCreateCode(root, "報告書");

  let folder_name = exe_No.toString();

  const exe_folder = folderCreateCode(root_folder, folder_name);

  //新規ファイルをフォルダへ移動
  const exe_file = DriveApp.getFileById(lay_cpy_ID);
  exe_file.moveTo(exe_folder);

  
  /*新規ファイルをPDFに変換しフォルダに作成（PDF形式での保存および月ごとのファイルの整理のため）
    昇順で並べられるように、識別番号を手前に記載*/
  let pdf_Name;
  if (exe_No >= 1000) {  
    pdf_Name = exe_No + "_" + exe_Date + "(" + exe_User + ")" + exe_No + ".pdf" ;
  } else {
    const pdf_No = exe_No.toString().padStart( 4, '0')
    pdf_Name = pdf_No + "_" +  exe_Date + "(" + exe_User + ")" + exe_No + ".pdf";
  }
  
  const pFile = SpreadsheetApp.openById(lay_cpy_ID);
  const pdfFile = pFile.getAs(MimeType.PDF);

  //PDFフォルダを指定 「○○年○○月」でフォルダを作成
  const pdfFolder_Id =  PropertiesService.getScriptProperties().getProperty("PDFFOLDER_ID") || "YOUR_PDFFOLDER_ID";
  const pdf_folder = DriveApp.getFolderById(pdfFolder_Id);
  const target_name = exe_Date.substring(0, 7);
  let pdf_target_folder = pdf_folder.getFoldersByName(target_name);
  console.log(target_name);

  //既存のフォルダがあれば採用、なければ作成
  let pdf_move_folder;
  let move_folder_Id;
  if(pdf_target_folder.hasNext()){
    pdf_move_folder = pdf_target_folder.next();
    console.log("フォルダ「" + target_name + "」を作成しなかった");
    move_folder_Id = pdf_move_folder.getId();
  } else {
    pdf_move_folder = pdf_folder.createFolder(target_name);
    console.log("フォルダ「" + target_name + "」を作成した");
    move_folder_Id = pdf_move_folder.getId();
    console.log("folder_Id : " + folder_Id);
  }
  
  //フォルダの移動
  DriveApp.getFolderById(move_folder_Id).createFile(pdfFile).setName(pdf_Name);

  //メールパラメータ
  const mailTitle = exe_Date + "(" + exe_User + ")" + exe_No;
  const mailText = "添付ファイル付きメールです。";

  console.log("送信前");
  console.log(lay_cpy_ID);

  //メール送信
  GmailApp.sendEmail(address, mailTitle, mailText, {
    attachments: [pdfFile],
    name: 'ここに宛先に表示される名前を入れてください'
  });
  

  console.log("送信後");
  console.log(lay_cpy_ID);

}


function summarizeOnSubmit(form_sheet, form_lastRow) {
  // 14列目(N列,詳細内容部分)の値を取得
  const targetText = form_sheet.getRange(form_lastRow, 14).getDisplayValue(); 

  // APIキー
  const apiKey = PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY"); 
  
  // 万が一プロパティが設定されていない場合のエラー回避
  if (!apiKey) {
    console.error("APIキーが設定されていません。スクリプトプロパティを確認してください。");
    return "実行エラー: APIキーが設定されていません。";
  }
  
  // gemini-2.5-flashによる要約の実施
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const payload = {
    "contents": [{
      "parts": [{
        "text": 
        "#役割 あなたはプロの編集者です。#タスク 以下の文章を250字以内に要約してください。#制約条件・常態（だ・である）調で記載すること・改行せず、1つの文章として書くこと ・文字数を記載しないこと ・できる限り文章の文言を変えずに要約すること：\n\n" + targetText
      }]
    }]
  };

  const options = {
    "method": "post",
    "contentType": "application/json",
    "payload": JSON.stringify(payload),
    "muteHttpExceptions": true 
  };

  // --- リトライ処理の追加 ---
  let response;
  let success = false;
  let retries = 0;
  const maxRetries = 3; // 最大3回リトライする

  while (retries < maxRetries && !success) {
    try {
      response = UrlFetchApp.fetch(apiUrl, options);
      const resCode = response.getResponseCode();

      if (resCode === 200) {
        success = true; // 成功
      } else if (resCode === 503 || resCode === 429 || resCode === 500) {
        // サーバー混雑(503)やレート制限(429)の場合、待機してリトライ
        console.warn(`モデルが混雑しています。${retries + 1}回目のリトライを行います...`);
        // 指数バックオフ（2秒、4秒、8秒と待機時間を増やす）
        Utilities.sleep(Math.pow(2, retries) * 2000); 
        retries++;
      } else {
        // その他のエラー（認証エラーなど）はリトライせずに終了
        throw new Error("HTTPエラー: " + resCode);
      }
    } catch (e) {
      console.error("通信エラー: " + e.message);
      Utilities.sleep(2000);
      retries++;
    }
  }

  if (!success) {
    const finalResText = response ? response.getContentText() : "通信失敗";
    form_sheet.getRange(lastRow, 27).setValue("AIエラー: サーバーが混雑しています。後で再実行してください。");
    console.error("最終エラー詳細:", finalResText);
    return;
  }
  // -------------------------

  try {
    const resText = response.getContentText();
    const json = JSON.parse(resText);

    if (json.candidates && json.candidates[0].content) {
      const summary = json.candidates[0].content.parts[0].text.trim();
      // 27列目(AA列)に書き込み
      form_sheet.getRange(form_lastRow, 27).setValue(summary);
      console.log("成功！要約を書き込みました。");
    } else {
      const errorMsg = json.error ? json.error.message : "レスポンス形式が不正です";
      form_sheet.getRange(form_lastRow, 27).setValue("解析エラー: " + errorMsg);
    }
  } catch (e) {
    form_sheet.getRange(form_lastRow, 27).setValue("実行エラー: " + e.message);
  }
}
 

