Add-Type -AssemblyName System.Drawing

$imagesDir = (Resolve-Path "public/images").Path
$backupDir = Join-Path $imagesDir "raw_originals"

if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
    Write-Output "Created backup directory: $backupDir"
}

$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]85)

1..4 | ForEach-Object {
    $num = $_
    $filename = "HERO SECTION ($num).jpg"
    $srcPath = Join-Path $imagesDir $filename
    $bakPath = Join-Path $backupDir $filename

    if (-not (Test-Path $srcPath)) {
        Write-Warning "File not found: $srcPath"
        return
    }

    # Backup original if not already backed up
    if (-not (Test-Path $bakPath)) {
        Copy-Item -Path $srcPath -Destination $bakPath -Force
        Write-Output "Backed up original $filename ($((Get-Item $bakPath).Length) bytes)"
    } else {
        Write-Output "Original already backed up: $bakPath ($((Get-Item $bakPath).Length) bytes)"
    }

    # Read from backup to resize safely
    $origImg = [System.Drawing.Image]::FromFile($bakPath)
    $origWidth = $origImg.Width
    $origHeight = $origImg.Height
    $origSize = (Get-Item $bakPath).Length

    # Target: 2048px max width for ultra-sharp Retina/4K display without excessive file size
    $targetWidth = 2048
    if ($origWidth -lt $targetWidth) {
        $targetWidth = $origWidth
    }
    $targetHeight = [int]($origHeight * ($targetWidth / $origWidth))

    $destBitmap = New-Object System.Drawing.Bitmap($targetWidth, $targetHeight)
    $graph = [System.Drawing.Graphics]::FromImage($destBitmap)
    $graph.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graph.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graph.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graph.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    $graph.DrawImage($origImg, 0, 0, $targetWidth, $targetHeight)

    # Save to temp file first to ensure atomic write
    $tempOut = Join-Path $imagesDir "temp_hero_$num.jpg"
    $destBitmap.Save($tempOut, $codec, $encoderParams)

    $graph.Dispose()
    $destBitmap.Dispose()
    $origImg.Dispose()

    # Move temp over target
    Move-Item -Path $tempOut -Destination $srcPath -Force

    $newSize = (Get-Item $srcPath).Length
    $reduction = [math]::Round((1 - ($newSize / $origSize)) * 100, 1)
    Write-Output "Optimized $filename : ${origWidth}x${origHeight} ($([math]::Round($origSize/1MB, 2)) MB) -> ${targetWidth}x${targetHeight} ($([math]::Round($newSize/1KB, 1)) KB) [${reduction}% smaller]"
}

Write-Output "Hero images optimization complete!"
