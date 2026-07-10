$ErrorActionPreference = 'Stop'
$src = Join-Path $PSScriptRoot '..\..\Fotos\WordCloud.svg'
$out = Join-Path $PSScriptRoot 'wordcloud-inline.fragment.html'
$s = [System.IO.File]::ReadAllText($src, [System.Text.Encoding]::UTF8)

function Escape-HtmlAttr([string]$x) {
  if ($null -eq $x) { return '' }
  return $x.Replace('&', '&amp;').Replace('"', '&quot;').Replace('<', '&lt;')
}

function Get-PlainTextFromTextInner([string]$inner) {
  $plain = [regex]::Replace($inner, '<[^>]+>', '')
  return $plain.Trim()
}

# XML-Deklaration entfernen (inline eingebettet)
$s = [regex]::Replace($s, '<\?xml[^?]*\?>\s*', '', 1)

# SVG-Wurzel fuer die Seite
$s = [regex]::Replace(
  $s,
  '<svg\s+id="Ebene_1"',
  '<svg id="sst-wordcloud-svg" class="sst-wordcloud__svg" focusable="false" aria-label="Themenwolke Selbststaendigkeit"',
  1
)

# Jedes <text>...</text> als Gruppe (data-wc-label = sichtbarer Text)
$matches = [regex]::Matches($s, '(?s)<text(\s[^>]*)>(.*?)</text>')
if ($matches.Count -eq 0) {
  throw 'Kein <text> in WordCloud.svg gefunden. Export pruefen (Pfade vs. Text).'
}

$wraps = New-Object System.Collections.Generic.List[object]
foreach ($m in $matches) {
  $plain = Get-PlainTextFromTextInner $m.Groups[2].Value
  if ([string]::IsNullOrWhiteSpace($plain)) { $plain = 'Begriff' }
  $attr = Escape-HtmlAttr $plain
  $wrapped = '<g class="wordcloud-word" data-wc-label="' + $attr + '" role="group" aria-label="' + $attr + '">' + $m.Value + '</g>'
  [void]$wraps.Add([pscustomobject]@{ Start = $m.Index; Len = $m.Length; Replacement = $wrapped })
}

$ordered = $wraps | Sort-Object -Property Start -Descending
$sb = New-Object System.Text.StringBuilder($s.Length + $wraps.Count * 80)
[void]$sb.Append($s)
foreach ($w in $ordered) {
  [void]$sb.Remove($w.Start, $w.Len)
  [void]$sb.Insert($w.Start, $w.Replacement)
}

$outStr = $sb.ToString()
[System.IO.File]::WriteAllText($out, $outStr, [System.Text.UTF8Encoding]::new($false))
Write-Host "OK out=$out textGroups=$($matches.Count)"
