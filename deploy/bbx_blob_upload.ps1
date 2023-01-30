param (
    [string]$sourcePath = "c:\mine\Developments\BBX\bbx-ui-win32-x64_0.1.96_CUSOMER.zip",
    [string]$destinationPath = "c:\mine\Developments\BBX\bbxUI\",
    [string]$uiPath = "dist\bbx-ui\"
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

Write-Output "-- sourcePath:" $sourcePath
Write-Output "-- destinationPath:" $destinationPath
Write-Output "-- uiPath:" $uiPath


Write-Output "New-AzStorageContext... - 2"
$StorageContext = New-AzStorageContext -StorageAccountName 'bbxtestcustomerfe' -StorageAccountKey 'S4vQyGVrOwKlaj6eF954Wl4yj2L1Jccd9SfmSOMVsIDyv3hME/65FKUlouut7Pr+CwC/YDYZNU/wDWOwebPNtw=='


Write-Output "Get-AzStorageContext... - 3"
$Container = Get-AzStorageContainer -Context $StorageContext -Name "$web"


# ez maradhat kikommentezve
#$blobs = Get-AzStorageBlob -Container "test" -Context $StorageContext
#Write-Output "Get-AzStorageBlob... - 4"

Write-Output "Delete files from Unzip folder... - 5"
Get-ChildItem -Path $destinationPath -Recurse | Remove-Item -force -recurse


Write-Output "Unzip... - 6"
Expand-Archive -Path $sourcePath -DestinationPath $destinationPath


Write-Output "Remove-AzStorageBlob contents... - 7"
Get-AzStorageBlob -Container '$web' -Blob * -Context $StorageContext | Remove-AzStorageBlob

Write-Output "Get LocalFolder... - 8"
$localFolder = $destinationPath + $uiPath
Write-Output $localFolder

$containername = "$" + "web"
Write-Output "--" $containername "--"


$files = Get-ChildItem $localFolder -File -Recurse
  foreach($file in $files)
  {
	$targetPath = ($file.fullname.Substring($localFolder.Length)).Replace("\", "/")
	Set-AzStorageBlobContent -Container $containername -File $file.FullName -Blob $targetPath -Context $StorageContext -Force -Properties @{"ContentType" = [System.Web.MimeMapping]::GetMimeMapping($file)}
	Write-Output $file-Name
  }
  
Get-ChildItem -Path $destinationPath -Recurse | Remove-Item -force -recurse
Write-Output "Remove Unzipped files from folder... - 9"

Write-Output "END... - 10"