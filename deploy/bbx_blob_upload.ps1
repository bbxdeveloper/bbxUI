param (
    [string]$sourcePath = "c:\mine\Developments\BBX\bbx-ui-win32-x64_0.1.92_CUSTOMER2.zip",
    [string]$destinationPath = "c:\mine\Developments\BBX\bbxUI\2",
    [string]$uiPath = "dist\bbx-ui\2"
)

###############################################################
# AZURE STORAGE BLOB UPLOADER                                 #
# ---------------------------                                 #
# Feltolt egy .zip-ben levo tartarlmat Azure  Storage Blob-ba #
#                                                             #
# Jelenleg a BBX UI tartalmanak Azure Blobba valo feltolte-   #
# sere van kihegyezve                                         #
# De hasznalhatod ugy, h csak egy reszet futtatod,            #
# szabadon hasznalhatod a kod barmely reszet                  #
#                                                             #
# MUKODES:                                                    #
# - letrehoz egy context-et, ami a blob-ra mutat:             #
#   Azure Portal-rol kigyujthetok az adatok                   #
# - kitorli a file-okat, amik esetleg meg benne vannak        #
#   ahova uznip-elunk                                         # 
# - kicsomagolja a .zip allomanyt                             #
# - kitolri a blob-ban benne levo tartalmat                   #
# - kivalaszt a kibontott tartalomban egy adott konyvtarat    #
# - file-onkent feltotlest vegez                              #
# - kitorli a kibontott tartlmat az adott konyvtarbol         #
#                                                             #
# PARAMETEREK:                                                #
# - $sourcePath: a kibontando .zip-re mutat                   #
# - $destinationPath: hova bontsa ki a .zip tartalmat         #
# - $uiPath: a kibontott tartalmon belule magadott Path       #
#   tartalmat                                                 #
#   masolja fel Azure blob-ba                                 #
#                                                             #
# PELDA FUTTATAS:                                             #
# .\bbx_blob_upload.ps1 -sourcePath "c:\mine\Developments\BBX\bbx-ui-win32-x64_0.1.92_CUSTOMER.zip" -destinationPath "c:\mine\Developments\BBX\bbxUI\" -uiPath "dist\bbx-ui\"
###############################################################


Write-Output "STARTING... - 1"

$StorageContext = New-AzStorageContext -StorageAccountName 'bbx' -StorageAccountKey 'W6pStudoWs5SVxEJCwZeDILx5Kv1gYQ0Rut5P+ggnOpFSGI7CH5d4gjR2wwS60ey4ULYC+EgKkznMGsoxlYIGw=='
Write-Output "New-AzStorageContext... - 2"

$Container = Get-AzStorageContainer -Context $StorageContext -Name "test"
Write-Output "Get-AzStorageContext... - 3"

#$blobs = Get-AzStorageBlob -Container "test" -Context $StorageContext
#Write-Output "Get-AzStorageBlob... - 4"

Get-ChildItem -Path $destinationPath -Recurse | Remove-Item -force -recurse
Write-Output "Delete files from Unzip folder... - 5"

Expand-Archive -Path $sourcePath -DestinationPath $destinationPath
Write-Output "Unzip... - 6"

Get-AzStorageBlob -Container 'test' -Blob * -Context $StorageContext | Remove-AzStorageBlob
Write-Output "Remove-AzStorageBlob contents... - 7"

$localFolder = $destinationPath + $uiPath
Write-Output "Get LocalFolder... - 8"

$files = Get-ChildItem $localFolder -File -Recurse
  foreach($file in $files)
  {
	$targetPath = ($file.fullname.Substring($localFolder.Length)).Replace("\", "/")
	Set-AzStorageBlobContent -Container "test" -File $file.FullName -Blob $targetPath -Context $StorageContext -Force
	Write-Output $file-Name
  }
  
Get-ChildItem -Path $destinationPath -Recurse | Remove-Item -force -recurse
Write-Output "Remove Unzipped files from folder... - 9"

Write-Output "END... - 10"