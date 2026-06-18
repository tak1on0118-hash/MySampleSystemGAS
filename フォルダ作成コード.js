function folderCreateCode(root_folder, folder_name) {
  let folder_finder = root_folder.getFoldersByName(folder_name);
  let find_folder;

  if(folder_finder.hasNext()){
    find_folder = folder_finder.next();
    console.log("フォルダ" + folder_name + "を作成しませんでした");
  } else {
    find_folder = root_folder.createFolder(folder_name);
    console.log("フォルダ" + folder_name + "を作成しました");
    
  }

  return find_folder
}
