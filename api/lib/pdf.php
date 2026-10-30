<?php
// Branded A4 estimate PDF (docs/QUOTE-ENGINE.md §6), built with FPDF (MIT-style licence).
declare(strict_types=1);

require_once __DIR__ . '/fpdf/fpdf.php';

/** FPDF core fonts use Windows-1252; convert and replace characters it can't show. */
function pdf_txt(string $s): string
{
    $s = strtr($s, ['–' => '-', '—' => '-', '’' => "'", '‘' => "'", '“' => '"', '”' => '"', '·' => '-', '×' => 'x', ' ' => ' ']);
    return (string) iconv('UTF-8', 'windows-1252//TRANSLIT', $s);
}

function build_estimate_pdf(string $ref, array $contact, array $service, array $tier, array $est, array $book): string
{
    $navy = [10, 27, 46]; $teal = [29, 161, 194]; $ink2 = [61, 75, 92]; $line = [228, 231, 236];
    $pdf = new FPDF('P', 'mm', 'A4');
    $pdf->SetMargins(18, 18, 18);
    $pdf->SetAutoPageBreak(true, 26);
    $pdf->SetTitle(pdf_txt("TshedzaWebDev estimate $ref"));
    $pdf->SetAuthor('TshedzaWebDev');
    $pdf->AddPage();

    // Header band
    $pdf->SetFillColor(...$navy); $pdf->Rect(0, 0, 210, 44, 'F');
    $pdf->SetFillColor(255, 255, 255); $pdf->Rect(18, 13, 14, 14, 'F');
    $pdf->SetDrawColor(...$navy); $pdf->SetLineWidth(1.3);
    $pdf->Line(21.9, 17.6, 28.1, 17.6); $pdf->Line(25, 17.6, 25, 23.6);
    $pdf->SetFillColor(...$teal); $pdf->Rect(28.4, 22.6, 1.8, 1.8, 'F');
    $pdf->SetTextColor(255, 255, 255); $pdf->SetFont('Helvetica', 'B', 13);
    $pdf->SetXY(36, 14); $pdf->Cell(80, 6, 'TshedzaWebDev');
    $pdf->SetFont('Helvetica', '', 8.5); $pdf->SetTextColor(170, 190, 205);
    $pdf->SetXY(36, 20); $pdf->Cell(80, 5, pdf_txt('Crafting Exceptional Web Experiences - Pretoria'));
    $pdf->SetFont('Helvetica', 'B', 18); $pdf->SetTextColor(255, 255, 255);
    $pdf->SetXY(110, 12); $pdf->Cell(82, 8, 'Project estimate', 0, 2, 'R');
    $pdf->SetFont('Helvetica', '', 9); $pdf->SetTextColor(170, 190, 205);
    $valid = (int) $book['rules']['estimateValidDays'];
    $pdf->Cell(82, 5, pdf_txt("$ref  -  " . gmdate('j M Y') . "  -  valid $valid days"), 0, 2, 'R');

    // Client + project
    $pdf->SetY(54); $pdf->SetTextColor(...$navy);
    $pdf->SetFont('Helvetica', 'B', 8); $pdf->SetTextColor(15, 117, 144);
    $pdf->Cell(87, 5, 'PREPARED FOR'); $pdf->Cell(87, 5, 'PROJECT', 0, 1);
    $pdf->SetTextColor(...$navy); $pdf->SetFont('Helvetica', 'B', 11);
    $pdf->Cell(87, 6, pdf_txt($contact['name'])); $pdf->Cell(87, 6, pdf_txt($service['name'] . ': ' . $tier['name']), 0, 1);
    $pdf->SetFont('Helvetica', '', 9.5); $pdf->SetTextColor(...$ink2);
    $pdf->Cell(87, 5, pdf_txt($contact['business'] !== '' ? $contact['business'] : $contact['email']));
    $pdf->Cell(87, 5, pdf_txt('Estimated timeline: about ' . $est['weeks'] . ' week' . ($est['weeks'] === 1 ? '' : 's')), 0, 1);

    // Range box
    $pdf->Ln(6);
    $y = $pdf->GetY();
    $pdf->SetFillColor(227, 244, 248); $pdf->Rect(18, $y, 174, 26, 'F');
    $pdf->SetXY(24, $y + 4); $pdf->SetFont('Helvetica', 'B', 8); $pdf->SetTextColor(15, 117, 144);
    $pdf->Cell(80, 5, 'ESTIMATED INVESTMENT', 0, 2);
    $pdf->SetFont('Helvetica', 'B', 20); $pdf->SetTextColor(...$navy);
    $headline = $est['oneOff'] > 0 ? twd_rand($est['low']) . ' - ' . twd_rand($est['high']) : twd_rand($est['monthly']) . ' / month';
    $pdf->Cell(110, 11, pdf_txt($headline));
    if ($est['oneOff'] > 0 && $est['monthly'] > 0) {
        $pdf->SetFont('Helvetica', '', 11); $pdf->Cell(52, 11, pdf_txt('+ ' . twd_rand($est['monthly']) . ' / month'), 0, 0, 'R');
    }
    $pdf->SetY($y + 32);

    // Line items
    $row = function (string $label, string $amount, bool $bold = false) use ($pdf, $line, $navy, $ink2) {
        $pdf->SetFont('Helvetica', $bold ? 'B' : '', 10);
        $pdf->SetTextColor(...($bold ? $navy : $ink2));
        $pdf->Cell(134, 8, pdf_txt($label)); $pdf->Cell(40, 8, pdf_txt($amount), 0, 1, 'R');
        $pdf->SetDrawColor(...$line); $pdf->SetLineWidth(0.2); $pdf->Line(18, $pdf->GetY(), 192, $pdf->GetY());
    };
    $pdf->SetFont('Helvetica', 'B', 8); $pdf->SetTextColor(15, 117, 144);
    $pdf->Cell(134, 6, 'WHAT IS INCLUDED'); $pdf->Cell(40, 6, 'AMOUNT', 0, 1, 'R');
    foreach ($est['lines'] as $l) $row($l['label'], twd_rand($l['amount']));
    if ($est['oneOff'] > 0) $row('Once-off total (estimate)', twd_rand($est['oneOff']), true);
    if ($est['monthlyLines']) {
        $pdf->Ln(4);
        $pdf->SetFont('Helvetica', 'B', 8); $pdf->SetTextColor(15, 117, 144); $pdf->Cell(174, 6, 'MONTHLY', 0, 1);
        foreach ($est['monthlyLines'] as $l) $row($l['label'], twd_rand($l['amount']) . ' / month');
    }

    // Terms + next steps
    $pdf->Ln(8);
    $pdf->SetFont('Helvetica', 'B', 11); $pdf->SetTextColor(...$navy); $pdf->Cell(174, 6, 'What happens next', 0, 1);
    $pdf->SetFont('Helvetica', '', 9.5); $pdf->SetTextColor(...$ink2);
    $steps = [
        '1.  A short discovery call (WhatsApp or video) to confirm what you need.',
        '2.  A written quote with a fixed price, scope and timeline.',
        '3.  ' . ($est['deposit'] > 0 ? 'A 50% deposit (about ' . twd_rand($est['deposit']) . ') secures your slot and starts the work.' : 'Work starts once you accept the quote.'),
        '4.  Design, build, launch and hand-over.',
    ];
    foreach ($steps as $s) $pdf->MultiCell(174, 5.5, pdf_txt($s));
    $pdf->Ln(4);
    $pdf->SetFont('Helvetica', 'I', 8.5);
    $pdf->MultiCell(174, 4.6, pdf_txt('This is an estimate based on the options you selected, not a binding quote. TshedzaWebDev is not VAT registered: no VAT is added. All amounts are in South African rand. Price book ' . $est['pricebookVersion'] . '.'));

    // Footer (pinned to the bottom of page 1; no auto page break while drawing it)
    $pdf->SetAutoPageBreak(false);
    $pdf->SetY(-22);
    $pdf->SetDrawColor(...$line); $pdf->Line(18, $pdf->GetY(), 192, $pdf->GetY());
    $pdf->SetFont('Helvetica', '', 8.5); $pdf->SetTextColor(...$ink2);
    $pdf->Cell(174, 7, pdf_txt('TshedzaWebDev - Pretoria, South Africa - info@tshedzawebdev.co.za - WhatsApp 069 951 3836 - tshedzawebdev.co.za'), 0, 1, 'C');
    $pdf->SetFont('Helvetica', '', 7.5);
    $pdf->Cell(174, 4, pdf_txt('Your information is processed in line with POPIA - see tshedzawebdev.co.za/privacy'), 0, 1, 'C');

    return $pdf->Output('S');
}
