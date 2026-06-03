$productsPath = "data\products.csv"
$assetMapPath = "data\product-asset-map.csv"

$rules = @(
  @("不锈钢管（环压）", "stainless-pipe-press"),
  @("不锈钢管(环压)", "stainless-pipe-press"),
  @("防腐保温管", "anti-corrosion-insulated-pipe"),
  @("聚氨酯保温管", "pu-insulated-pipe"),
  @("瓦楞覆塑管", "corrugated-coated-pipe"),
  @("内外螺纹", "male-female-thread"),
  @("外螺纹", "male-thread"),
  @("内螺纹", "female-thread"),
  @("螺母纹移动", "nut-thread-movable"),
  @("螺母移动", "nut-movable"),
  @("凸面板式平焊法兰", "raised-face-plate-slip-on-flange"),
  @("凸面法兰", "raised-face-flange"),
  @("法兰", "flange"),
  @("双层覆塑", "double-layer-coated"),
  @("不锈钢", "stainless"),
  @("覆塑管", "coated-pipe"),
  @("覆塑", "coated"),
  @("保温管", "insulated-pipe"),
  @("保温", "insulated"),
  @("管桥", "pipe-bridge"),
  @("直管", "straight-pipe"),
  @("沟槽", "grooved"),
  @("环压", "press"),
  @("双卡", "double-press"),
  @("单卡", "single-press"),
  @("对焊", "butt-weld"),
  @("插焊", "socket-weld"),
  @("A型", "type-a"),
  @("B型", "type-b"),
  @("短型", "short"),
  @("短", "short"),
  @("双承", "double-socket"),
  @("自制", "custom"),
  @("挂墙", "wall-mounted"),
  @("碟阀专用", "butterfly-valve"),
  @("PN16", "pn16"),
  @("PN25", "pn25"),
  @("A-UV", "a-uv"),
  @("A-UA", "a-ua"),
  @("A-VU", "a-vu"),
  @("1.35D", "135d"),
  @("45°", "45"),
  @("90°", "90"),
  @("等径", "equal"),
  @("异径", "reducing"),
  @("偏心", "eccentric"),
  @("中大", "large-center"),
  @("可调", "adjustable"),
  @("转换", "adapter"),
  @("转接", "adapter"),
  @("对接", "coupling"),
  @("接头", "connector"),
  @("弯头", "elbow"),
  @("三通", "tee"),
  @("四通", "cross"),
  @("管帽", "cap"),
  @("卡箍", "clamp"),
  @("红色", "red"),
  @("深蓝色", "dark-blue"),
  @("蓝色", "blue"),
  @("银色", "silver"),
  @("白色", "white"),
  @("灰色", "gray"),
  @("8孔", "8-hole"),
  @("管", "pipe")
)

function Get-ShortHash([string]$text) {
  $sha = [System.Security.Cryptography.SHA1]::Create()
  $bytes = [System.Text.Encoding]::UTF8.GetBytes($text)
  $hash = $sha.ComputeHash($bytes)
  (($hash[0..2] | ForEach-Object { $_.ToString("x2") }) -join "")
}

function New-AssetSlug([string]$name) {
  $slug = $name.Trim()
  foreach ($rule in $script:rules) {
    $slug = $slug.Replace($rule[0], "-" + $rule[1] + "-")
  }

  $slug = $slug -replace "[（）()\[\]【】，,。/\\、：:；;＋+&]", "-"
  $slug = $slug -replace "[°º]", ""
  $slug = $slug.ToLowerInvariant()
  $slug = $slug -replace "[^a-z0-9]+", "-"
  $slug = $slug.Trim("-")

  if (-not $slug) {
    $slug = "product-" + (Get-ShortHash $name)
  }

  return $slug
}

$names = Import-Csv -Path $productsPath -Encoding UTF8 |
  Select-Object -ExpandProperty name -Unique |
  Where-Object { $_ -and $_.Trim() }

$rows = foreach ($name in $names) {
  [PSCustomObject]@{
    name = $name
    asset_slug = New-AssetSlug $name
  }
}

$rows | Export-Csv -Path $assetMapPath -NoTypeInformation -Encoding UTF8

$blankCount = ($rows | Where-Object { -not $_.asset_slug }).Count
Write-Output "names=$($rows.Count)"
Write-Output "blank_asset_slug=$blankCount"


