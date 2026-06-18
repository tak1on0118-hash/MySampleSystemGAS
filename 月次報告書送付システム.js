function monthlyReportCreateSystem() {
  
  //スプレッドシート情報
  const form_ID = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_FORM_ID") || "YOUR_SPREADSHEET_FORM_ID";
  const form_sheetName = 'フォームの回答';

  //報告書レイアウトのスプレッドシート情報
  const layout_ID =  PropertiesService.getScriptProperties().getProperty("SPREADSHEET_LAYOUT_ID") || "YOUR_SPREADSHEET_LAYOUT_ID";
  const write_Name = "転記先";

  //IDを指定してスプリットシート,'フォーム回答'シートを取得
  const form_ss = SpreadsheetApp.openById(form_ID);
  const form_sheet = form_ss.getSheetByName(form_sheetName);

  //シート’フォームの回答’の行数および列数を数える
  const form_lastRow = form_sheet.getLastRow();
  const form_lastCol = form_sheet.getLastColumn();

  if(form_lastRow > 1){
    form_sheet.getRange(2, 1, form_lastRow - 1, form_lastCol).sort({column: 1, ascending: true});
  }
  
  //配列で取得(1行目、1列、行数、列数)
  const all_data = form_sheet.getRange(form_lastRow,1,1,form_lastCol).getDisplayValues();

  console.log(all_data);

  console.log("識別番号は" + all_data[0][3]);// 識別番号
  console.log("記入者は" + all_data[0][2]);// 記入者名
  console.log("実施日は"+ all_data[0][4]);// 実施日

  const spreadsheetId = SpreadsheetApp.getActiveSpreadsheet().getId();
  console.log("spreadsheetId : " + spreadsheetId);

  //対象年月のフォルダを作成
  const root = DriveApp.getRootFolder();
  const target_montly = all_data[0][4].slice(0,7);    
  const exe_folder = folderCreateCode(root, target_montly);
  
  //対象NO.のファイルをレイアウトからコピーして作成
  //すでに存在すれば作成しない
  
  let fileName = "【" + target_montly + "】" + all_data[0][3];
  let fileFinder = exe_folder.getFilesByName(fileName);
  let lay_cpy_ID;
  if( fileFinder.hasNext() ) {
    console.log("ファイル「" + fileName  + "」はすでに存在します")
    lay_cpy_ID = fileFinder.next().getId();
  } else {
  //レイアウトからコピーして報告書ファイルを作成
    const layout = DriveApp.getFileById(layout_ID); 
    const file = layout.makeCopy(fileName, exe_folder);
    lay_cpy_ID = file.getId();
    console.log("ファイル「" + fileName + "」を作成しました");
  }

  //報告書コピーに抽出したデータを書き込む
  //対象のファイル、シートを選択

  const monthly_ss = SpreadsheetApp.openById(lay_cpy_ID);
  const monthly_sheet = monthly_ss.getSheetByName(write_Name);

  //月次報告書の最終行、最終列の取得
  const monthly_lastRow = monthly_sheet.getLastRow();
  const monthly_lastCol = monthly_sheet.getLastColumn();

  console.log("最終行は : " + monthly_lastRow);
  console.log("最終列は : " + monthly_lastCol);

  let target_row = monthly_lastRow + 1;

  if(monthly_lastRow > 1)
  {
    for(let i = monthly_lastRow; i > 1; i--)
    {
      const target_date =  monthly_sheet.getRange(i, 5).getDisplayValue();
      if(target_date == all_data[0][4])
      {
        const target_name = monthly_sheet.getRange(i, 3).getDisplayValue();
        if(target_name == all_data[0][2])
        {
          target_row = i;
          break;
        }
      }
    }
  } 

  monthly_sheet.getRange(target_row,1,1,monthly_lastCol).setValues(all_data); //書き込む
 

}


