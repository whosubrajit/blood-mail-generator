class RichTextBuilder {
  static String buildHtml({
    required String bg,
    required String rs,
    required String loc,
    required String ph,
    required String dt,
    required String am,
    required String tm,
  }) {
    // Trim values to avoid whitespace issues
    bg = bg.trim();
    rs = rs.trim();
    loc = loc.trim();
    ph = ph.trim();
    dt = dt.trim();
    am = am.trim();
    tm = tm.trim();

    // Default fallbacks if empty
    final safeBg = bg.isEmpty ? '[Blood Group]' : bg;
    final safeRs = rs.isEmpty ? '[Reason]' : rs;
    final safeLoc = loc.isEmpty ? '[Location]' : loc;
    final safePh = ph.isEmpty ? '[Phone]' : ph;

    // Use <font color="..."> instead of CSS spans, as Android's Html.fromHtml 
    // and Gmail strip CSS style tags but respect legacy <font> tags.
    List<String> details = [];
    details.add('<b>Blood Type:</b> <font color="red"><b>$safeBg</b></font>');
    if (am.isNotEmpty) {
      details.add('<b>Amount :</b> <font color="red"><b>$am</b></font>');
    }
    details.add('<b>Contact Number:</b> <font color="blue"><b>$safePh</b></font>');
    details.add('<b>Location:</b> <font color="blue"><b>$safeLoc</b></font>');
    if (dt.isNotEmpty) {
      details.add('<b>Date:</b> <font color="red"><b>$dt</b></font>');
    }
    if (tm.isNotEmpty) {
      details.add('<b>Time:</b> <font color="red"><b>$tm</b></font>');
    }

    final detailsHtml = details.join('<br>');

    // Build the single-line minified HTML.
    return '<html><body><font color="#000000">Greetings,<br>Emergency <font color="red"><b>$safeBg</b></font> blood needed for <b>$safeRs</b> at <font color="blue"><b>$safeLoc</b></font>. If anyone is available, please contact <font color="blue"><b>$safePh</b></font> as soon as possible. Thank you.<br><br><u><b>DETAILS:</b></u><br>$detailsHtml</font></body></html>';
  }

  static String buildPlainText({
    required String bg,
    required String rs,
    required String loc,
    required String ph,
    required String dt,
    required String am,
    required String tm,
  }) {
    // A simple plain text fallback for devices that don't support rich text pasting
    bg = bg.trim().isEmpty ? '[Blood Group]' : bg.trim();
    rs = rs.trim().isEmpty ? '[Reason]' : rs.trim();
    loc = loc.trim().isEmpty ? '[Location]' : loc.trim();
    ph = ph.trim().isEmpty ? '[Phone]' : ph.trim();
    dt = dt.trim();
    am = am.trim();
    tm = tm.trim();

    StringBuffer buffer = StringBuffer();
    buffer.writeln('Greetings,');
    buffer.writeln('Emergency $bg blood needed for $rs at $loc. If anyone is available, please contact $ph as soon as possible. Thank you.');
    buffer.writeln();
    buffer.writeln('DETAILS:');
    buffer.writeln('Blood Type: $bg');
    if (am.isNotEmpty) buffer.writeln('Amount : $am');
    buffer.writeln('Contact Number: $ph');
    buffer.writeln('Location: $loc');
    if (dt.isNotEmpty) buffer.writeln('Date: $dt');
    if (tm.isNotEmpty) buffer.writeln('Time: $tm');

    return buffer.toString();
  }
}
