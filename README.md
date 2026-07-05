**【GAS × Gemini API】フォーム連動型 報告書自動生成・仕分け・送付システム**  
Googleフォームの回答データを起点に、日次報告書（PDF）の自動生成・AI要約・Gmail送付、および月次報告書への自動集計・フォルダ仕分けまでを一気通貫で行う業務効率化システムです。

---
＜システム概要＞  
本システムは、現場の報告業務における「手作業での転記」「レイアウトの調整」「手動でのメール送信」といった業務を完全に自動化し、DX（デジタルトランスフォーメーション）を推進することを目的に開発しました。  

＜主な機能＞  
・日報の自動生成・AI要約・メール送付 (`報告書送付システム.js`)  
 Googleフォームから送信された詳細な報告内容を、`gemini-2.5-flash` モデルを用いて指定文字数（250字以内）かつ指定フォーマット（常体調）に自動要約。  
 入力された文字数・改行数に応じてスプレッドシートの行数を動的に削除・調整し、PDF出力時のレイアウト崩れや無駄な余白を自動で防止。  
 生成したPDFを指定の年月フォルダへ自動仕分けし、担当者へGmailで自動送信。  

・月次報告書の自動集計・仕分け (`月次報告書作成システム.js`)  
 フォーム回答から対象年月（YYYY-MM）を判別し、Googleドライブ内に対象フォルダがなければ自動作成、あれば既存フォルダを採用。  
 テンプレート（レイアウト用スプレッドシート）から当月用の報告書を自動コピー。  
 記入者名と実施日をもとに**既存データの一致を確認（重複チェック）**し、新規行への書き込み、または対象行への上書き転記を制御。  

---
＜スプレッドシート・テンプレートの取得＞    
本システムを動作させるためのスプレッドシート（帳票レイアウト）のひな形を用意しています。  
以下のリンクからプレビューを確認し、ご自身のGoogleドライブにコピーしてご利用いただけます。  

Googleフォームのテンプレートはこちら  
https://docs.google.com/forms/d/16YuFEZx3vDfO-ReMBUnoNX1TwTpMQabML4vqhtiU2h8/copy  
レイアウト用のテンプレートはこちら  
https://docs.google.com/spreadsheets/d/1u3-8Jv2pROXcsqJQu3aDJ23PZEW7JjK9jUSlpDm5CpA/copy  

※サンプル  
フォームの回答例:  
https://docs.google.com/spreadsheets/d/17KYTweK7eIakwSsqACT8WEn6pnkPgApl7CrlJjNL5Bs/copy  
報告書ファイル例:  
https://docs.google.com/spreadsheets/d/1LPYOVGY0t6KxnyUW2oSCUW4N8UG_hLihvSqt824A-is/copy   

---
＜導入・環境構築手順＞  
本システムをご自身の環境で再現・動作確認するための手順です。  
1. フォームの回答用シートの作成  
上記の「Googleフォームのテンプレートはこちら」から、新しいフォームを取得。そちらの「回答」タブから「スプレッドシートにリンク」をクリック。新しいスプレッドシートが作成されます。

2. レイアウト用のシートの作成  
上記の「レイアウト用ののテンプレートはこちら」から、新しいスプレッドシートを取得します。

3. スクリプトファイルの作成  
「1.フォームの回答用シートの作成」で作ったシートの「拡張機能」＞「Apps Script」をクリック。左上のファイルの右上にある＋マークから新しいスクリプトを作成。そちらにGitHubにあげている4つのコード（「フォルダ作成コード.js」「月次報告書送付システム.js」「実行コード.js」「報告書送付システム.js」）をコピー＆ペーストします。  
※ それぞれ別々のファイル（スクリプト）としてコピー＆ペーストしてください。  

3. スクリプトプロパティ（環境変数）の設定  
Google Apps Script の「プロジェクトの設定」>「スクリプトプロパティ」に以下のキーと値を設定してください。シートIDはURLの `/d/` と `/edit` の間の文字列です。
  
プロパティ名	  |&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp; | 設定する値	&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp; | 説明  
`SPREADSHEET_FORM_ID`	&emsp;&emsp;&emsp;   あなたのフォーム回答用シートのID &emsp;&emsp;&emsp;	        フォーム回答が蓄積されるシートのID  
`SPREADSHEET_LAYOUT_ID`	&emsp;&emsp;   あなたのレイアウト用シートのID &emsp;&emsp;&emsp;&emsp;        PDF出力および転記先となる帳票のID  
`PDFFOLDER_ID`  &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;	           GoogleドライブのフォルダID	 &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;     出力されたPDFを格納する親フォルダのID  
`GEMINI_API_KEY`  &emsp;&emsp;&emsp;&emsp;&emsp;	       あなたのGemini APIキー  &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;	       Google AI Studio等で取得したAPIキー  

5. トリガーの設定  
Google Apps Scriptの「トリガー」＞「トリガーの追加」より、実行する関数「excutionCode」を選択。イベントの種類を「フォーム送信時」に変更してください。  
上記の設定が完了したら保存します。  

1～3の設定が完了しましたら、Googleフォームに送られてくる回答が自動で報告書として、出力されます。  
