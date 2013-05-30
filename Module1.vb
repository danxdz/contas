Imports System.IO


Module rosca
    Public Sub calc()
        With Form1
            If .dm_value.Text <> "" And .passo_value.Text <> "" Then
                Dim constant_f As Decimal
                check_dot(.passo_value)
                '.passo_value.Text = .passo_value.Text.Replace(".", ",")
                .re_res.Text = FormatNumber(.dm_value.Text - (1.2268 * .passo_value.Text), 3)
                constant_f = 2 * (0.045 * .passo_value.Text)
                .ri_res.Text = FormatNumber(.dm_value.Text + constant_f, 3)
                .af_ex.Text = FormatNumber(0.61343 * .passo_value.Text, 3)
                .af_ex.Text = .af_ex.Text.TrimStart("0")
                .af_ex.Text = .af_ex.Text.Replace(".", "")
                .af_ex.Text = .af_ex.Text.Replace(",", "")
                constant_f = .dm_value.Text - (1.0825 * .passo_value.Text)
                .af_in.Text = FormatNumber((.ri_res.Text - constant_f) / 2, 3)
                .af_in.Text = .af_in.Text.TrimStart("0")
                .af_in.Text = .af_in.Text.Replace(".", "")
                .af_in.Text = .af_in.Text.Replace(",", "")
                .dma_value.Text = FormatNumber(constant_f, 3)
                .dma_value.Text = .dma_value.Text.Replace(",", ".")
                .ri_res.Text = .ri_res.Text.Replace(",", ".")
                .re_res.Text = .re_res.Text.Replace(",", ".")
            End If
        End With


    End Sub
    Public Sub calc_passo()
        With Form1

            Dim tmp As String = .dm_value.Text

            If tmp <> "" Then

                If tmp <= 1.4 Then
                    .passo_value.Text = 0.25
                Else
                    If tmp >= 1.4 And tmp < 1.6 Then
                        .passo_value.Text = 0.3
                    Else
                        If tmp >= 1.6 And tmp < 2 Then
                            .passo_value.Text = 0.35
                        Else
                            If tmp >= 2 And tmp < 2.2 Then
                                .passo_value.Text = 0.4
                            Else
                                If tmp >= 2.2 And tmp < 3 Then
                                    .passo_value.Text = 0.45
                                Else
                                    If tmp >= 3 And tmp < 3.5 Then
                                        .passo_value.Text = 0.5
                                    Else
                                        If tmp >= 3.5 And tmp < 4 Then
                                            .passo_value.Text = 0.6
                                        Else
                                            If tmp >= 4 And tmp < 4.5 Then
                                                .passo_value.Text = 0.7
                                            Else
                                                If tmp >= 4.5 And tmp < 5 Then
                                                    .passo_value.Text = 0.75
                                                Else
                                                    If tmp >= 5 And tmp < 6 Then
                                                        .passo_value.Text = 0.8
                                                    Else
                                                        If tmp >= 6 And tmp < 8 Then
                                                            .passo_value.Text = 1
                                                        Else
                                                            If tmp >= 8 And tmp < 10 Then
                                                                .passo_value.Text = 1.25
                                                            Else
                                                                If tmp >= 10 And tmp < 12 Then
                                                                    .passo_value.Text = 1.5
                                                                Else
                                                                    If tmp >= 12 And tmp < 18 Then
                                                                        .passo_value.Text = 2
                                                                    Else
                                                                        If tmp >= 18 And tmp < 24 Then
                                                                            .passo_value.Text = 2.5
                                                                        Else
                                                                            If tmp >= 24 And tmp < 30 Then
                                                                                .passo_value.Text = 3
                                                                            Else
                                                                                If tmp >= 30 And tmp < 36 Then
                                                                                    .passo_value.Text = 3.5
                                                                                Else
                                                                                    If tmp >= 36 And tmp < 42 Then
                                                                                        .passo_value.Text = 4
                                                                                    Else
                                                                                        If tmp >= 42 Then
                                                                                            .passo_value.Text = 4.5
                                                                                        End If
                                                                                    End If
                                                                                End If
                                                                            End If
                                                                        End If
                                                                    End If
                                                                End If
                                                            End If
                                                        End If
                                                    End If
                                                End If
                                            End If
                                        End If
                                    End If
                                End If
                            End If
                        End If
                    End If
                End If
            End If

        End With

    End Sub
    Public Sub check_dot(tmp)
        tmp.Text = tmp.Text.Replace(",", ".")
    End Sub



End Module

Module Vc_fresa
    Public fresa_mat, fresa_mat_selected As Integer
    Public Sub save_mat(new_vc1 As String, new_vc2 As String, new_vc3 As String, new_mat As String)
        With Form1
            Dim Path = IO.Path.Combine(Application.StartupPath, "text.txt")
            Dim res = new_mat & "!#" & new_vc1 & "!#" & new_vc2 & "!#" & new_vc3
            Dim objWriter As New System.IO.StreamWriter(Path, True)
            If System.IO.File.Exists(Path) Then
                objWriter.WriteLine(res)
            Else
                objWriter.Write(res)
            End If
            objWriter.Close()
            MsgBox("Text written to file")
            'Console.ReadLine()
            show_mat()
        End With
    End Sub
    Public Sub list_vc(vcc As String, n As Integer)
        Dim FirstCharacter As Integer
        Dim len As Integer
        With Form1
            FirstCharacter = vcc.IndexOf("!")
            len = vcc.Length

            If .past_value.CheckState = CheckState.Checked Then
                vcc = Microsoft.VisualBasic.Left(vcc, FirstCharacter)
            Else
                If .hss_value.CheckState = CheckState.Checked Then
                    len = len - 2
                    len = len - FirstCharacter
                    vcc = Microsoft.VisualBasic.Right(vcc, len)
                    FirstCharacter = vcc.IndexOf("!")
                    vcc = Microsoft.VisualBasic.Left(vcc, FirstCharacter)
                Else
                    If .mduro_value.CheckState = CheckState.Checked Then
                        len = len - 2
                        len = len - FirstCharacter
                        vcc = Microsoft.VisualBasic.Right(vcc, len)
                        FirstCharacter = vcc.IndexOf("!")
                        len = vcc.Length
                        len = len - 2
                        len = len - FirstCharacter
                        vcc = Microsoft.VisualBasic.Right(vcc, len)

                    End If
                End If
            End If

            .fr_mat_list.Rows.Item(n).Cells(1).Value = vcc

            '.vc_list.Items.Add(vcc)
        End With
    End Sub
    Public Sub show_mat()


        With Form1
            Dim Path = IO.Path.Combine(Application.StartupPath, "text.txt")
            If System.IO.File.Exists(Path) Then
                Dim objReader As New StreamReader(Path)
                Dim sLine As String = ""
                Dim arrText As New ArrayList()
                Dim arrVc As New ArrayList()
                Dim cod As String
                Dim vcc As String
                .fr_mat_list.Rows.Clear()
                '.mat_list.Items.Clear()
                '.vc_list.Items.Clear()
                Do
                    sLine = objReader.ReadLine()
                    If Not sLine Is Nothing And sLine <> "" Then
                        Dim FirstCharacter As Integer = sLine.IndexOf("!")
                        Dim len As Integer = sLine.Length
                        len -= 2
                        len = len - FirstCharacter
                        cod = Microsoft.VisualBasic.Left(sLine, FirstCharacter)
                        vcc = Microsoft.VisualBasic.Right(sLine, len)
                        'cod = cod & "!#" & vcc
                        '.mat_list.Items.Add(cod)

                        Dim n As Integer = .fr_mat_list.Rows.Add()
                        .fr_mat_list.Rows.Item(n).Cells(0).Value = cod
                        list_vc(vcc, n)
                    End If
                Loop Until sLine Is Nothing
                objReader.Close()
            End If
        End With
    End Sub
    Public Sub calc_inc()
        With Form1
            If .diam_value.Text <> "" Then
                If .inc_1.CheckState = CheckState.Checked Then
                    .inc_ae_value.Text = Form1.diam_value.Text
                    .inc_ap_value.Text = Form1.diam_value.Text * 0.05
                Else
                    If .inc_2.CheckState = CheckState.Checked Then
                        .inc_ae_value.Text = Form1.diam_value.Text * 0.05
                        .inc_ap_value.Text = Form1.diam_value.Text * 2
                    End If
                End If
            End If
        End With
    End Sub
    Public Sub calc_numdentes()
        With Form1
            If .diam_value.Text <> "" Then

                If .hss_value.CheckState = CheckState.Checked Then
                    If .diam_value.Text < 4 Then
                        .ndentes.Text = "2"
                    Else
                        .ndentes.Text = "4"
                    End If
                ElseIf .past_value.CheckState = CheckState.Checked Or .mduro_value.CheckState = CheckState.Checked Then
                    If .diam_value.Text < 20 Then
                        .ndentes.Text = "2"
                    ElseIf .diam_value.Text >= 20 And .diam_value.Text < 60 Then
                        .ndentes.Text = "4"
                    Else
                        .ndentes.Text = "6"
                    End If
                End If
            End If
        End With
    End Sub
End Module

Module Vc_tornos
    Public torno_mat, torno_mat_selected As Integer

    Public Sub save_mat(new_vc1 As String, new_vc2 As String, new_vc3 As String, new_vc4 As String, new_vc5 As String, new_mat As String)
        With Form1
            Dim Path = IO.Path.Combine(Application.StartupPath, "text_torno.txt")
            Dim res = new_mat & "!#" & new_vc1 & "!#" & new_vc2 & "!#" & new_vc3 & "!#" & new_vc4 & "!#" & new_vc5
            Dim objWriter As New System.IO.StreamWriter(Path, True)
            If System.IO.File.Exists(Path) Then
                objWriter.WriteLine(res)
            Else
                objWriter.Write(res)
            End If
            objWriter.Close()
            MsgBox("Text written to file")
            'Console.ReadLine()
            torno_show_mat(torno_mat)
        End With
    End Sub
    Public Sub torno_show_mat(cont As Integer)
        With Form1
            Dim Path = IO.Path.Combine(Application.StartupPath, "text_torno.txt")
            If System.IO.File.Exists(Path) Then
                Dim objReader As New StreamReader(Path)
                Dim sLine As String = ""
                Dim arrText As New ArrayList()
                Dim arrVc As New ArrayList()
                Dim cod As String
                Dim vcc As String
                '.mat_list_torno.Items.Clear()
                ''.vc_list_torno.Items.Clear()
                .mats_torno.Rows.Clear()
                Do
                    sLine = objReader.ReadLine()
                    If Not sLine Is Nothing And sLine <> "" Then
                        Dim FirstCharacter As Integer = sLine.IndexOf("!")
                        Dim len As Integer = sLine.Length
                        len -= 2
                        len = len - FirstCharacter
                        cod = Microsoft.VisualBasic.Left(sLine, FirstCharacter)
                        vcc = Microsoft.VisualBasic.Right(sLine, len)
                        'cod = cod & "!#" & vcc
                        '.mat_list_torno.Items.Add(cod)

                       

                        Dim n As Integer = .mats_torno.Rows.Add()
                        .mats_torno.Rows.Item(n).Cells(0).Value = cod
                        list_vc_torno(vcc, cont, n)
                    End If
                Loop Until sLine Is Nothing
                objReader.Close()
            End If
           
            '.mat_list_torno.SetSelected(torno_mat_selected, True)

            '.vc_list_torno.SetSelected(torno_mat_selected, True)
            highlight_data(torno_mat_selected)
        End With

    End Sub
    Public Sub list_vc_torno(vcc As String, cont As Integer, n As Integer)
        Dim FirstCharacter As Integer
        Dim len As Integer

        With Form1
            FirstCharacter = vcc.IndexOf("!")
            len = vcc.Length


            Dim tmp As String


            For i As Integer = 2 To cont
                len = len - 2
                len = len - FirstCharacter
                vcc = Microsoft.VisualBasic.Right(vcc, len)
                FirstCharacter = vcc.IndexOf("!")
            Next
            If FirstCharacter > 0 Then
                tmp = Microsoft.VisualBasic.Left(vcc, FirstCharacter)
            Else
                tmp = vcc
            End If
            .mats_torno.Rows.Item(n).Cells(1).Value = tmp
            ' vcc = Microsoft.VisualBasic.Right(vcc, len)
            ' .vc_list_torno.Items.Add(tmp)
        End With
    End Sub
    Public Sub highlight_data(i As Integer)
        With Form1
            .vc_t.Text = .mats_torno.Item(1, i).Value
            .mats_torno.Item(1, i).Selected = True
            .mats_torno.Item(0, 0).Selected = False
            .mats_torno.Item(0, i).Selected = True
            'torno_mat_selected = i
        End With
    End Sub
    Public strTest As String
    Private Sub CONTCOLUMN()
        Dim contcolumn As New DataGridViewTextBoxColumn
        With contcolumn
            .HeaderText = "mats"
            .Name = strTest
        End With
        Form1.mats_torno.Columns.Insert(0, contcolumn)
        Dim contcolumn2 As New DataGridViewTextBoxColumn
        With contcolumn2
            .HeaderText = "vc"
            .Name = strTest
        End With
        Form1.mats_torno.Columns.Insert(0, contcolumn2)
        Dim contcolumn3 As New DataGridViewTextBoxColumn
        With contcolumn3
            .HeaderText = "mats"
            .Name = strTest
        End With
        Form1.fr_mat_list.Columns.Insert(0, contcolumn3)
        Dim contcolumn4 As New DataGridViewTextBoxColumn
        With contcolumn4
            .HeaderText = "vc"
            .Name = strTest
        End With
        Form1.fr_mat_list.Columns.Insert(0, contcolumn4)
    End Sub
    Public Sub start()
        strTest = ""
        CONTCOLUMN()
    End Sub
    Public Sub calc_n()
        With Form1
            If .diam_torno.Text <> "" And .vc_t.Text <> "" Then
                Dim diam = .diam_torno.Text
                Dim vc = .vc_t.Text
                Dim tmp = (vc * 1000) / (Math.PI * diam)
                .n_t.Text = tmp
            End If
        End With
    End Sub

    Public Sub calc_f()
        Dim ra, rp As Decimal
        With Form1
            ra = .ra_list.SelectedItem
            ra = ra * 5
            rp = .rp_list.SelectedItem
            .f_t.Text = Math.Round(Math.Sqrt(8 * ra * rp / 1000), 3)
        End With
    End Sub
End Module


Module trig
    Public Sub clear()
        With Form1
            .h_value.Text = ""
            .ca_value.Text = ""
            .co_value.Text = ""
            .angulo_value.Text = ""
            .opc_tri.Text = "0"
            .angd_value.Text = ""
            .angd_value.ReadOnly = True
            .angulo_value.ReadOnly = False
            .h_value.ReadOnly = False
            .ca_value.ReadOnly = False
            .co_value.ReadOnly = False
        End With
    End Sub
    Private Sub cont(ind)
        With Form1
            If .angulo_value.Text <> "" Then
                ind = ind + 1
            End If
            If .co_value.Text <> "" Then
                ind = ind + 1
            End If
            If .ca_value.Text <> "" Then
                ind = ind + 1
            End If
            If .h_value.Text <> "" Then
                ind = ind + 1
            End If
            If .angd_value.Text <> "" Then
                ind = ind + 1
            End If
        End With
    End Sub
    Public Sub calc_ang()

        Dim radians As Double
        Dim ind As Integer
        cont(ind)

        With Form1

            If ind <= 2 Then
                .ca_value.ReadOnly = True
                .h_value.ReadOnly = True
                .co_value.ReadOnly = True
                .angulo_value.ReadOnly = True
                .angd_value.ReadOnly = True
                If .angulo_value.Text <> "" Then
                    ' tan
                    If (.angulo_value.Text > 0) And (.angulo_value.Text < 180) Then
                        radians = (.angulo_value.Text * Math.PI) / 180
                        If .co_value.Text <> "" Then
                            '  calcular ca e h com co e a
                            .ca_value.Text = FormatNumber(.co_value.Text / Math.Tan(radians), 3)
                            .h_value.Text = FormatNumber(.co_value.Text / Math.Sin(radians), 3)
                            .angd_value.Text = 90 - .angulo_value.Text
                        ElseIf .ca_value.Text <> "" Then
                            ' calcular co e h  com ca e a
                            .co_value.Text = FormatNumber(Math.Tan(radians) * .ca_value.Text, 3)
                            .h_value.Text = FormatNumber(.ca_value.Text / Math.Cos(radians), 3)
                            .angd_value.Text = 90 - .angulo_value.Text
                            ' calcular co e ca com h e a
                        ElseIf .h_value.Text <> "" Then
                            .co_value.Text = FormatNumber(Math.Sin(radians) * .h_value.Text, 3)
                            .ca_value.Text = FormatNumber(.h_value.Text * Math.Cos(radians), 3)
                            .angd_value.Text = 90 - .angulo_value.Text
                        End If
                        'sen
                    End If
                Else
                    If .h_value.Text <> "" Then
                        If .ca_value.Text <> "" Then
                            'calcular co e ad com ca e h
                            .co_value.Text = Math.Round(Math.Sqrt((.h_value.Text * .h_value.Text) - (.ca_value.Text * .ca_value.Text)), 3)

                            .opc_tri.Text = .ca_value.Text / .h_value.Text
                            .angulo_value.Text = Math.Asin(.opc_tri.Text)
                            .angulo_value.Text = Math.Round((.angulo_value.Text * 180) / Math.PI, 3)

                            .opc_tri.Text = .ca_value.Text / .h_value.Text
                            .angd_value.Text = Math.Acos(.opc_tri.Text)
                            .angd_value.Text = Math.Round((.angd_value.Text * 180) / Math.PI, 3)
                        ElseIf .co_value.Text <> "" Then
                            'calcular ca e ad com co e h
                            .ca_value.Text = Math.Round(Math.Sqrt((.h_value.Text * .h_value.Text) - (.co_value.Text * .co_value.Text)), 3)

                            .opc_tri.Text = .co_value.Text / .h_value.Text
                            .angulo_value.Text = Math.Asin(.opc_tri.Text)
                            .angulo_value.Text = Math.Round((.angulo_value.Text * 180) / Math.PI, 3)

                            .opc_tri.Text = .co_value.Text / .h_value.Text
                            .angd_value.Text = Math.Acos(.opc_tri.Text)
                            .angd_value.Text = Math.Round((.angd_value.Text * 180) / Math.PI, 3)
                        End If
                    End If
                    'calcular h , a e ad com co e ca
                    If .co_value.Text <> "" Then
                        If .ca_value.Text <> "" Then
                            .h_value.Text = Math.Round(Math.Sqrt((.co_value.Text * .co_value.Text) + (.ca_value.Text * .ca_value.Text)), 3)
                            .opc_tri.Text = .co_value.Text / .ca_value.Text
                            .angulo_value.Text = Math.Atan(.opc_tri.Text)
                            .angulo_value.Text = Math.Round((.angulo_value.Text * 180) / Math.PI, 3)
                            .opc_tri.Text = .ca_value.Text / .co_value.Text
                            .angd_value.Text = Math.Atan(.opc_tri.Text)
                            .angd_value.Text = Math.Round((.angd_value.Text * 180) / Math.PI, 3)
                        End If
                    End If
                End If
            End If
        End With
    End Sub
End Module