function executionCode() {
  //報告書送付システムの起動
  console.log("報告書送付システム起動");
  dailyReportSendSystem();

  //月次報告書送付システムの起動
  console.log("月次報告書送付システム起動");
  monthlyReportCreateSystem();
}
