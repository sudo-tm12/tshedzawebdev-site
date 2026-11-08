<?php
// Branded A4 estimate PDF (docs/QUOTE-ENGINE.md §6), built with FPDF (MIT-style licence).
// The brand is the wordmark only ("Tshedza" + teal "WebDev"): there is no icon mark.
declare(strict_types=1);

require_once __DIR__ . '/fpdf/fpdf.php';

/** FPDF core fonts use Windows-1252, which has – — ’ “ ” · ×; anything else is transliterated. */
function pdf_txt(string $s): string
{
    $s = strtr($s, ["\u{202F}" => ' ', "\u{00A0}" => ' ', '✓' => '']);
    return (string) iconv('UTF-8', 'windows-1252//TRANSLIT', $s);
}

/** FPDF plus rounded rectangles, circles, letter-spaced labels and a footer on every page. */
final class TwdPdf extends FPDF
{
    public const NAVY = [10, 27, 46];
    public const TEAL = [29, 161, 194];
    public const TEAL_DARK = [15, 117, 144];
    public const TEAL_TINT = [227, 244, 248];
    public const INK2 = [61, 75, 92];
    public const INK3 = [95, 107, 122];
    public const LINE = [228, 231, 236];

    public function RoundedRect(float $x, float $y, float $w, float $h, float $r, string $style = ''): void
    {
        $k = $this->k; $hp = $this->h;
        $op = $style === 'F' ? 'f' : (($style === 'FD' || $style === 'DF') ? 'B' : 'S');
        $a = 4 / 3 * (sqrt(2) - 1);
        $this->_out(sprintf('%.2F %.2F m', ($x + $r) * $k, ($hp - $y) * $k));
        $xc = $x + $w - $r; $yc = $y + $r;
        $this->_out(sprintf('%.2F %.2F l', $xc * $k, ($hp - $y) * $k));
        $this->arc($xc + $r * $a, $yc - $r, $xc + $r, $yc - $r * $a, $xc + $r, $yc);
        $xc = $x + $w - $r; $yc = $y + $h - $r;
        $this->_out(sprintf('%.2F %.2F l', ($x + $w) * $k, ($hp - $yc) * $k));
        $this->arc($xc + $r, $yc + $r * $a, $xc + $r * $a, $yc + $r, $xc, $yc + $r);
        $xc = $x + $r; $yc = $y + $h - $r;
        $this->_out(sprintf('%.2F %.2F l', $xc * $k, ($hp - ($y + $h)) * $k));
        $this->arc($xc - $r * $a, $yc + $r, $xc - $r, $yc + $r * $a, $xc - $r, $yc);
        $xc = $x + $r; $yc = $y + $r;
        $this->_out(sprintf('%.2F %.2F l', $x * $k, ($hp - $yc) * $k));
        $this->arc($xc - $r, $yc - $r * $a, $xc - $r * $a, $yc - $r, $xc, $yc - $r);
        $this->_out($op);
    }

    public function Circle(float $x, float $y, float $r, string $style = 'F'): void
    {
        $k = $this->k; $hp = $this->h;
        $op = $style === 'F' ? 'f' : (($style === 'FD' || $style === 'DF') ? 'B' : 'S');
        $l = 4 / 3 * (sqrt(2) - 1) * $r;
        $p = fn(float $px, float $py) => sprintf('%.2F %.2F', $px * $k, ($hp - $py) * $k);
        $this->_out($p($x + $r, $y) . ' m');
        $this->_out($p($x + $r, $y + $l) . ' ' . $p($x + $l, $y + $r) . ' ' . $p($x, $y + $r) . ' c');
        $this->_out($p($x - $l, $y + $r) . ' ' . $p($x - $r, $y + $l) . ' ' . $p($x - $r, $y) . ' c');
        $this->_out($p($x - $r, $y - $l) . ' ' . $p($x - $l, $y - $r) . ' ' . $p($x, $y - $r) . ' c');
        $this->_out($p($x + $l, $y - $r) . ' ' . $p($x + $r, $y - $l) . ' ' . $p($x + $r, $y) . ' c');
        $this->_out($op);
    }

    private function arc(float $x1, float $y1, float $x2, float $y2, float $x3, float $y3): void
    {
        $k = $this->k; $h = $this->h;
        $this->_out(sprintf('%.2F %.2F %.2F %.2F %.2F %.2F c', $x1 * $k, ($h - $y1) * $k, $x2 * $k, ($h - $y2) * $k, $x3 * $k, ($h - $y3) * $k));
    }

    /** A small uppercase, letter-spaced label. With $rightEdge set, it ends at that x instead of starting at $x. */
    public function Eyebrow(float $x, float $y, string $text, array $rgb = self::TEAL_DARK, ?float $rightEdge = null): void
    {
        $t = pdf_txt(strtoupper($text));
        $spacing = 0.32;
        $this->SetFont('Helvetica', 'B', 7.5);
        $this->SetTextColor(...$rgb);
        if ($rightEdge !== null) $x = $rightEdge - ($this->GetStringWidth($t) + $spacing * (strlen($t) - 1));
        $this->_out(sprintf('%.3F Tc', $spacing * $this->k));
        $this->Text($x, $y, $t);
        $this->_out('0 Tc');
    }

    public function Footer(): void
    {
        $this->SetY(-17);
        $this->SetDrawColor(...self::LINE); $this->SetLineWidth(0.2);
        $this->Line(16, $this->GetY(), 194, $this->GetY());
        $this->SetY(-14.5);
        $this->SetFont('Helvetica', 'B', 8); $this->SetTextColor(...self::NAVY);
        $this->Cell(30, 4.5, 'Tshedza');
        $this->SetX(16 + $this->GetStringWidth('Tshedza'));
        $this->SetTextColor(...self::TEAL_DARK); $this->Cell(20, 4.5, 'WebDev');
        $this->SetX(16);
        $this->SetFont('Helvetica', '', 8); $this->SetTextColor(...self::INK2);
        $this->Cell(178, 4.5, pdf_txt('info@tshedzawebdev.co.za  ·  WhatsApp 069 951 3836  ·  tshedzawebdev.co.za'), 0, 1, 'R');
        $this->SetFont('Helvetica', '', 7); $this->SetTextColor(...self::INK3);
        $this->Cell(120, 4, pdf_txt('Pretoria, South Africa  ·  Your information is handled in line with POPIA: tshedzawebdev.co.za/privacy'));
        $this->Cell(58, 4, pdf_txt('Page ' . $this->PageNo() . ' of {nb}'), 0, 0, 'R');
    }
}

/**
 * @param array<string,mixed>|null $sel the client's selection (for the page/product count)
 */
function build_estimate_pdf(string $ref, array $contact, array $service, array $tier, array $est, array $book, ?array $sel = null): string
{
    $L = 16.0; $W = 178.0;
    $pdf = new TwdPdf('P', 'mm', 'A4');
    $pdf->AliasNbPages();
    $pdf->SetMargins($L, 16, $L);
    $pdf->SetAutoPageBreak(true, 20);
    $pdf->SetTitle(pdf_txt("TshedzaWebDev estimate $ref"));
    $pdf->SetAuthor('TshedzaWebDev');
    $pdf->SetCreator('TshedzaWebDev instant quote');
    $pdf->AddPage();

    $valid = (int) $book['rules']['estimateValidDays'];
    $issued = gmdate('j M Y');
    $until = gmdate('j M Y', time() + $valid * 86400);
    $oneOff = (int) $est['oneOff'];
    $monthly = (int) $est['monthly'];
    // Monthly packages (e.g. social media) lead with the monthly price; any setup is secondary.
    $monthlyLed = !isset($tier['base']) && isset($tier['monthlyBase']);
    $range = twd_rand((int) $est['low']) . ' – ' . twd_rand((int) $est['high']);

    // ── Header band: the wordmark, then the estimate's reference and dates ──
    $pdf->SetFillColor(...TwdPdf::NAVY); $pdf->Rect(0, 0, 210, 36, 'F');
    $pdf->SetFillColor(...TwdPdf::TEAL); $pdf->Rect(0, 36, 210, 1.1, 'F');
    $pdf->SetFont('Helvetica', 'B', 17); $pdf->SetTextColor(255, 255, 255);
    $pdf->Text($L, 17, 'Tshedza');
    $pdf->SetTextColor(...TwdPdf::TEAL); $pdf->Text($L + $pdf->GetStringWidth('Tshedza'), 17, 'WebDev');
    $pdf->SetFont('Helvetica', '', 8.5); $pdf->SetTextColor(159, 179, 200);
    $pdf->Text($L, 23.5, pdf_txt('Crafting Exceptional Web Experiences'));
    $pdf->Eyebrow(0, 11.5, 'Project estimate', TwdPdf::TEAL, 194);
    $pdf->SetFont('Helvetica', 'B', 16); $pdf->SetTextColor(255, 255, 255);
    $pdf->SetXY(110, 13.5); $pdf->Cell(84, 8, pdf_txt($ref), 0, 2, 'R');
    $pdf->SetFont('Helvetica', '', 8.5); $pdf->SetTextColor(159, 179, 200);
    $pdf->Cell(84, 5, pdf_txt("Issued $issued  ·  Valid until $until"), 0, 2, 'R');

    // ── Two cards: who it's for, and what it is ──
    $y = 45.0; $cw = ($W - 5) / 2;
    $who = array_values(array_filter([
        (string) ($contact['business'] ?? ''),
        (string) ($contact['email'] ?? ''),
        (string) ($contact['phone'] ?? '') !== '' ? 'WhatsApp ' . $contact['phone'] : '',
    ]));
    $unit = $service['unit'] ?? null;
    $units = $unit && $sel ? max((int) $unit['min'], min((int) $unit['max'], (int) round((float) ($sel['units'] ?? 0)))) : 0;
    $what = array_values(array_filter([
        $units > 0 ? $units . ' ' . ($units === 1 ? $unit['name'] : $unit['plural']) : '',
        $monthlyLed ? 'Billed monthly' : 'About ' . $est['weeks'] . ' week' . ((int) $est['weeks'] === 1 ? '' : 's') . (!empty($sel['priority']) ? ' (priority delivery)' : ''),
        $monthlyLed && $oneOff > 0 ? 'Setup in about ' . $est['weeks'] . ' week' . ((int) $est['weeks'] === 1 ? '' : 's') : '',
    ]));
    $ch = 16 + 5 * max(count($who), count($what));
    foreach ([[$L, 'Prepared for', (string) $contact['name'], $who], [$L + $cw + 5, 'Your project', $service['name'] . ' · ' . $tier['name'], $what]] as [$x, $label, $title, $lines]) {
        $pdf->SetDrawColor(...TwdPdf::LINE); $pdf->SetFillColor(255, 255, 255); $pdf->SetLineWidth(0.3);
        $pdf->RoundedRect($x, $y, $cw, $ch, 3, 'DF');
        $pdf->Eyebrow($x + 5, $y + 7, $label);
        $pdf->SetFont('Helvetica', 'B', 11.5); $pdf->SetTextColor(...TwdPdf::NAVY);
        $pdf->SetXY($x + 5, $y + 9); $pdf->Cell($cw - 10, 6, pdf_txt($title), 0, 2);
        $pdf->SetFont('Helvetica', '', 9); $pdf->SetTextColor(...TwdPdf::INK2);
        foreach ($lines as $line) $pdf->Cell($cw - 10, 5, pdf_txt($line), 0, 2);
    }

    // ── The investment panel ──
    $y += $ch + 5;
    $pdf->SetFillColor(...TwdPdf::NAVY); $pdf->RoundedRect($L, $y, $W, 30, 4, 'F');
    $pdf->SetFillColor(...TwdPdf::TEAL); $pdf->RoundedRect($L, $y, 2.4, 30, 1.2, 'F');
    $pdf->Eyebrow($L + 8, $y + 8, 'Estimated investment', TwdPdf::TEAL);
    $pdf->SetFont('Helvetica', 'B', 24); $pdf->SetTextColor(255, 255, 255);
    $big = $monthlyLed || $oneOff === 0 ? twd_rand($monthly) . ' / month' : $range;
    $pdf->Text($L + 8, $y + 18.5, pdf_txt($big));
    $pdf->SetFont('Helvetica', '', 8); $pdf->SetTextColor(159, 179, 200);
    $pdf->Text($L + 8, $y + 25, pdf_txt($monthlyLed || $oneOff === 0 ? 'Billed monthly. Your written quote confirms the package.' : 'A range for now. Your written quote fixes the price.'));
    $facts = [];
    if ($monthlyLed) {
        if ($oneOff > 0) $facts[] = ['Once-off setup', $range];
    } else {
        if ($oneOff > 0 && $monthly > 0) $facts[] = ['Monthly', '+ ' . twd_rand($monthly) . ' / month'];
        if ($oneOff > 0) $facts[] = ['Deposit to start', (int) $est['deposit'] > 0 ? twd_rand((int) $est['deposit']) : 'None needed'];
    }
    $fy = $y + 8;
    foreach ($facts as [$k, $v]) {
        $pdf->Eyebrow(150, $fy, $k, [159, 179, 200]);
        $pdf->SetFont('Helvetica', 'B', 11.5); $pdf->SetTextColor(255, 255, 255);
        $pdf->Text(150, $fy + 6, pdf_txt($v));
        $fy += 11.5;
    }

    // ── Line items with their workings ──
    $pdf->SetY($y + 30 + 6);
    $table = function (string $title, array $rows, string $suffix, ?array $total) use ($pdf, $L, $W) {
        $ty = $pdf->GetY();
        $pdf->SetFillColor(242, 247, 249); $pdf->RoundedRect($L, $ty, $W, 8, 2, 'F');
        $pdf->Eyebrow($L + 4, $ty + 5.3, $title);
        $pdf->SetFont('Helvetica', 'B', 7.5); $pdf->SetTextColor(...TwdPdf::TEAL_DARK);
        $pdf->SetXY($L, $ty + 1.5); $pdf->Cell($W - 4, 5, 'AMOUNT', 0, 1, 'R');
        $pdf->SetY($ty + 9);
        foreach ($rows as $row) {
            $detail = trim((string) ($row['detail'] ?? ''));
            $h = $detail !== '' ? 10.0 : 7.5;
            if ($pdf->GetY() + $h > 297 - 26) $pdf->AddPage();
            $ry = $pdf->GetY();
            $pdf->SetFont('Helvetica', '', 10); $pdf->SetTextColor(...TwdPdf::NAVY);
            $pdf->SetXY($L + 4, $ry + 1.3); $pdf->Cell(120, 5, pdf_txt((string) $row['label']));
            $pdf->SetFont('Helvetica', 'B', 10);
            $pdf->SetXY($L, $ry + 1.3); $pdf->Cell($W - 4, 5, pdf_txt(twd_rand((int) $row['amount']) . $suffix), 0, 0, 'R');
            if ($detail !== '') {
                $pdf->SetFont('Helvetica', '', 8); $pdf->SetTextColor(...TwdPdf::INK3);
                $pdf->SetXY($L + 4, $ry + 5.8); $pdf->Cell(130, 4, pdf_txt($detail));
            }
            $pdf->SetDrawColor(...TwdPdf::LINE); $pdf->SetLineWidth(0.2);
            $pdf->Line($L, $ry + $h, $L + $W, $ry + $h);
            $pdf->SetY($ry + $h);
        }
        if ($total) {
            $ry = $pdf->GetY() + 1;
            $pdf->SetDrawColor(...TwdPdf::TEAL); $pdf->SetLineWidth(0.5); $pdf->Line($L, $ry, $L + $W, $ry);
            $pdf->SetFont('Helvetica', 'B', 10.5); $pdf->SetTextColor(...TwdPdf::NAVY);
            $pdf->SetXY($L + 4, $ry + 2); $pdf->Cell(120, 6, pdf_txt($total[0]));
            $pdf->SetXY($L, $ry + 2); $pdf->Cell($W - 4, 6, pdf_txt($total[1]), 0, 1, 'R');
            $pdf->SetY($ry + 9);
        }
    };
    if ($est['lines']) $table('What is included', $est['lines'], '', $oneOff > 0 ? ['Once-off total', twd_rand($oneOff)] : null);
    if ($est['monthlyLines']) {
        $pdf->Ln(4);
        $table('Monthly', $est['monthlyLines'], ' / month', $monthly > 0 && count($est['monthlyLines']) > 1 ? ['Monthly total', twd_rand($monthly) . ' / month'] : null);
    }

    // ── What happens next: four numbered steps in two columns ──
    if ($pdf->GetY() + 40 > 297 - 20) $pdf->AddPage();
    $sy = $pdf->GetY() + 4;
    $pdf->SetFont('Helvetica', 'B', 12); $pdf->SetTextColor(...TwdPdf::NAVY);
    $pdf->Text($L, $sy + 4, 'What happens next');
    $steps = [
        ['A short call', 'On WhatsApp or video, to confirm what you need.'],
        ['A written quote', 'A fixed price, scope and timeline, in writing.'],
        [(int) $est['deposit'] > 0 ? 'A 50% deposit' : 'You say go', (int) $est['deposit'] > 0 ? 'About ' . twd_rand((int) $est['deposit']) . ' secures your slot and starts the work.' : 'Work starts as soon as you accept the quote.'],
        ['Design, build, launch', 'You approve the design, we build, test and hand everything over.'],
    ];
    foreach ($steps as $i => [$head, $body]) {
        $x = $L + ($i % 2) * ($W / 2);
        $yy = $sy + 8 + intdiv($i, 2) * 13;
        $pdf->SetFillColor(...TwdPdf::TEAL); $pdf->Circle($x + 3.6, $yy + 3.2, 3.6, 'F');
        $pdf->SetFont('Helvetica', 'B', 9); $pdf->SetTextColor(255, 255, 255);
        $pdf->SetXY($x, $yy + 0.7); $pdf->Cell(7.2, 5, (string) ($i + 1), 0, 0, 'C');
        $pdf->SetFont('Helvetica', 'B', 9.5); $pdf->SetTextColor(...TwdPdf::NAVY);
        $pdf->SetXY($x + 10, $yy + 0.2); $pdf->Cell($W / 2 - 14, 5, pdf_txt($head));
        $pdf->SetFont('Helvetica', '', 8.5); $pdf->SetTextColor(...TwdPdf::INK2);
        $pdf->SetXY($x + 10, $yy + 5.2); $pdf->MultiCell($W / 2 - 14, 4.1, pdf_txt($body), 0, 'L');
    }

    // ── Call to action ──
    $cy = $sy + 8 + 26 + 3;
    if ($cy + 27 > 297 - 20) { $pdf->AddPage(); $cy = 20; }
    $pdf->SetFillColor(...TwdPdf::TEAL_TINT); $pdf->RoundedRect($L, $cy, $W, 18, 3, 'F');
    $pdf->SetFont('Helvetica', 'B', 11); $pdf->SetTextColor(...TwdPdf::NAVY);
    $pdf->Text($L + 6, $cy + 7.5, 'Ready to go ahead?');
    $pdf->SetFont('Helvetica', '', 9); $pdf->SetTextColor(...TwdPdf::INK2);
    $pdf->Text($L + 6, $cy + 13, pdf_txt('Reply to this email or WhatsApp 069 951 3836. You speak to the person who builds your project.'));

    // ── Small print ──
    $pdf->SetXY($L, $cy + 22);
    $pdf->SetFont('Helvetica', 'I', 7.5); $pdf->SetTextColor(...TwdPdf::INK3);
    $pdf->Cell($W, 4, pdf_txt('Based on the options you selected; not a binding quote. All amounts are in South African rand.'), 0, 1);

    return $pdf->Output('S');
}
