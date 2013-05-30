



Imports System
Imports System.IO
Imports System.Text



Public Class Form1
    Private Sub calc_Click(sender As Object, e As EventArgs) Handles calc.Click
        rosca.calc()
    End Sub


  
    Private Sub angulo_value_Click(sender As Object, e As EventArgs) Handles angulo_value.Click
        If ca_value.Text <> "" Then
            co_value.ReadOnly = True
            h_value.ReadOnly = True
        End If
        If co_value.Text <> "" Then
            ca_value.ReadOnly = True
            h_value.ReadOnly = True
        End If
        If h_value.Text <> "" Then
            ca_value.ReadOnly = True
            co_value.ReadOnly = True
        End If
        If angulo_value.Text = "" & opc_tri.Text <= "1" Then
            angulo_value.ReadOnly = False
        End If
    End Sub
    Private Sub h_value_Click(sender As Object, e As EventArgs) Handles h_value.Click
        If ca_value.Text <> "" And co_value.Text <> "" Then
            co_value.ReadOnly = True
            angulo_value.ReadOnly = True
        End If
        If co_value.Text <> "" Then
            ca_value.ReadOnly = True
            angulo_value.ReadOnly = True
        End If
        If angulo_value.Text <> "" Then
            ca_value.ReadOnly = True
            co_value.ReadOnly = True
        End If
        If h_value.Text = "" & opc_tri.Text <= "1" Then
            h_value.ReadOnly = False
        End If
    End Sub
    Private Sub ca_value_Click(sender As Object, e As EventArgs) Handles ca_value.Click
        If h_value.Text <> "" Then
            co_value.ReadOnly = True
            angulo_value.ReadOnly = True
        End If
        If co_value.Text <> "" Then
            h_value.ReadOnly = True
            angulo_value.ReadOnly = True
        End If
        If angulo_value.Text <> "" Then
            h_value.ReadOnly = True
            co_value.ReadOnly = True
        End If
        If ca_value.Text = "" & opc_tri.Text <= "1" Then
            ca_value.Enabled = False
        End If
    End Sub
    Private Sub co_value_Click(sender As Object, e As EventArgs) Handles co_value.Click
        If h_value.Text <> "" Then
            ca_value.ReadOnly = True
            angulo_value.ReadOnly = True
        End If
        If ca_value.Text <> "" Then
            h_value.ReadOnly = True
            angulo_value.ReadOnly = True
        End If
        If angulo_value.Text <> "" Then
            h_value.ReadOnly = True
            ca_value.ReadOnly = True
        End If
        If co_value.Text = "" & opc_tri.Text <= "1" Then
            co_value.Enabled = False
        End If
    End Sub
    Private Sub reset_Click(sender As Object, e As EventArgs) Handles reset.Click
        trig.clear()
        copyl.Visible = False
        clipb.Visible = False
        clipb.Text = "-"
    End Sub
    Private Sub co_value_MouseDoubleClick(sender As Object, e As MouseEventArgs) Handles co_value.MouseDoubleClick
        If co_value.Text <> "" Then
            Clipboard.SetText(co_value.Text)
            copyl.Visible = True
            clipb.Visible = True
            clipb.Text = co_value.Text
        End If
    End Sub
    Private Sub h_value_DoubleClick(sender As Object, e As EventArgs) Handles h_value.DoubleClick
        If h_value.Text <> "" Then
            Clipboard.SetText(h_value.Text)
            copyl.Visible = True
            clipb.Visible = True
            clipb.Text = h_value.Text
        End If
    End Sub
    Private Sub ca_value_DoubleClick(sender As Object, e As EventArgs) Handles ca_value.DoubleClick
        If ca_value.Text <> "" Then
            Clipboard.SetText(ca_value.Text)
            copyl.Visible = True
            clipb.Visible = True
            clipb.Text = ca_value.Text
        End If
    End Sub
    Private Sub angulo_value_DoubleClick(sender As Object, e As EventArgs) Handles angulo_value.DoubleClick
        If angulo_value.Text <> "" Then
            Clipboard.SetText(angulo_value.Text)
            copyl.Visible = True
            clipb.Visible = True
            clipb.Text = angulo_value.Text
        End If
    End Sub
    Private Sub angd_value_DoubleClick(sender As Object, e As EventArgs) Handles angd_value.DoubleClick
        If angd_value.Text <> "" Then
            Clipboard.SetText(angd_value.Text)
            copyl.Visible = True
            clipb.Visible = True
            clipb.Text = angd_value.Text
        End If
    End Sub
    Private Sub re_res_DoubleClick(sender As Object, e As EventArgs) Handles re_res.DoubleClick
        If re_res.Text <> "" Then
            Clipboard.SetText(re_res.Text)
            copy2.Visible = True
            clipb2_value.Visible = True
            clipb2_value.Text = re_res.Text
        End If
    End Sub
    Private Sub af_in_DoubleClick(sender As Object, e As EventArgs) Handles af_in.DoubleClick
        If af_in.Text <> "" Then
            Clipboard.SetText(af_in.Text)
            copy2.Visible = True
            clipb2_value.Visible = True
            clipb2_value.Text = af_in.Text
        End If
    End Sub
    Private Sub dma_value_DoubleClick(sender As Object, e As EventArgs) Handles dma_value.DoubleClick
        If dma_value.Text <> "" Then
            Clipboard.SetText(dma_value.Text)
            copy2.Visible = True
            clipb2_value.Visible = True
            clipb2_value.Text = dma_value.Text
        End If
    End Sub
    Private Sub ri_res_DoubleClick(sender As Object, e As EventArgs) Handles ri_res.DoubleClick
        If ri_res.Text <> "" Then
            Clipboard.SetText(ri_res.Text)
            copy2.Visible = True
            clipb2_value.Visible = True
            clipb2_value.Text = ri_res.Text
        End If
    End Sub
    Private Sub af_ex_DoubleClick(sender As Object, e As EventArgs) Handles af_ex.DoubleClick
        If af_ex.Text <> "" Then
            Clipboard.SetText(af_ex.Text)
            copy2.Visible = True
            clipb2_value.Visible = True
            clipb2_value.Text = af_ex.Text
        End If
    End Sub
    Private Sub past_value_CheckedChanged(sender As Object, e As EventArgs) Handles past_value.CheckedChanged
        If past_value.CheckState = CheckState.Checked Then
            hss_value.CheckState = CheckState.Unchecked
            mduro_value.CheckState = CheckState.Unchecked
            show_mat()
            calc_f(1)
            Vc_fresa.calc_numdentes()
        End If
    End Sub
    Private Sub hss_value_CheckedChanged(sender As Object, e As EventArgs) Handles hss_value.CheckedChanged
        If hss_value.CheckState = CheckState.Checked Then
            past_value.CheckState = CheckState.Unchecked
            mduro_value.CheckState = CheckState.Unchecked
            show_mat()
            calc_f(2)
            Vc_fresa.calc_numdentes()
        End If
    End Sub
    Private Sub CheckBox1_CheckedChanged(sender As Object, e As EventArgs) Handles mduro_value.CheckedChanged
        If mduro_value.CheckState = CheckState.Checked Then
            past_value.CheckState = CheckState.Unchecked
            hss_value.CheckState = CheckState.Unchecked
            show_mat()
            calc_f(3)
            Vc_fresa.calc_numdentes()
        End If
    End Sub
    Private Sub calc_bt_Click(sender As Object, e As EventArgs) Handles calc_bt.Click
        calc_vc()
        calc_avan()
    End Sub
    Private Sub rot_res_DoubleClick(sender As Object, e As EventArgs) Handles rot_res.DoubleClick
        If rot_res.Text <> "" Then
            Clipboard.SetText(rot_res.Text)
            copy3.Visible = True
            clipb3.Visible = True
            clipb3.Text = rot_res.Text
        End If
    End Sub
    Private Sub calc_vc()
        'Imports System.Math
        If diam_value.Text <> "" And vc_opc.Text <> "" Then
            If hss_value.CheckState = CheckState.Checked Or past_value.CheckState = CheckState.Checked Or mduro_value.CheckState = CheckState.Checked Then
                rot_res.Text = FormatNumber((vc_opc.Text * 1000) / (Math.PI * diam_value.Text), 0)
                rot_res.Text = rot_res.Text.Replace(".", "")
            End If
        End If
    End Sub
    Private Sub calc_avan()
        check_dot(fdente)
        check_dot(ndentes)
                    If rot_res.Text <> "" Then
                        f_value.Text = ndentes.Text * fdente.Text * rot_res.Text
        End If
    End Sub
    Private Sub calc_f(tmp)


        If vc_opc.Text <> "" Then
            'vc_opc.Text = CStr(vc_list.Items(mat_list.SelectedIndex))


            calc_vc()
            calc_avan()
        End If
    End Sub
    Private Sub diam_value_LostFocus(sender As Object, e As EventArgs) Handles diam_value.LostFocus
        check_dot(diam_value)
        calc_vc()
    End Sub
    Private Sub bt_calc_Click(sender As Object, e As EventArgs) Handles bt_calc.Click
        Dim div As Double
        div = face_use.Value
        If vl_fresa.Text <> "" And vl_cp.Text <> "" And vl_lp.Text <> "" And vl_z.Text <> "" Then
            res_text.Text = ""
            Dim NLINHA, temp, PM, pass, pss, resto, pos_neg, pos_pos, y, pos, posy_pos, posx_ini, posx_fim, posy_ini, posy_fim, posz_ini, posz_fim As Double
            'res_text.Text = "pm= "
            PM = FormatNumber(vl_fresa.Text / 3 + 1, 3)
            pss = FormatNumber((vl_fresa.Text) - face_use.Value, 3)
            'res_text.Text &= PM & vbNewLine
            'pss = PM * 2
            temp = vl_cp.Text - (pss) 'y - (2*pm)
            'res_text.Text &= "pss-> "
            'res_text.Text &= pss & vbNewLine
            'res_text.Text &= "temp-> "
            'res_text.Text &= temp & vbNewLine
            pass = 1
            While temp > pss
                pass += 1
                temp = temp - pss
                'res_text.Text &= "PASS-> "
                'res_text.Text &= pass & vbNewLine
            End While
            temp = pass * pss
            resto = (vl_cp.Text - temp)
            resto = resto / 2
            'res_text.Text &= "resto-> "
            'res_text.Text &= resto & vbNewLine
            'res_text.Text &= "inicio:" & vbNewLine
            y = 0 - (vl_cp.Text / 2)
            temp = (vl_fresa.Text / 2) + 5
            pos_neg = 0 - temp
            pos_pos = temp + vl_lp.Text
            posx_ini = pos_neg + temp
            posx_fim = "+" & pos_pos - temp
            posy_ini = 0
            posy_fim = "+" & vl_cp.Text
            posz_ini = 0 - vl_z.Text
            posz_fim = 0.5
            posy_pos = 0 - (vl_fresa.Text + 5)
            If check0.Checked Then
                resto = y + resto
                temp = vl_fresa.Text + 5
                pos_neg = 0 - ((vl_lp.Text / 2) + temp)
                pos_pos = "+" & ((vl_lp.Text / 2) + temp)
                posy_pos = 0 - (vl_cp.Text / 2) - (vl_fresa.Text + 5)
                posy_ini = 0 - ((vl_cp.Text / 2))
                posy_fim = "+" & ((vl_cp.Text / 2))
                posx_ini = pos_neg + temp
                posx_fim = "+" & pos_pos - temp
            End If
            res_text.Text &= "N10 G30 G17 X" & posx_ini & " Y" & posy_ini & " Z" & posz_ini & "*" & vbNewLine
            res_text.Text &= "N20 G31 X" & posx_fim & " Y" & posy_fim & " Z" & posz_fim & "*" & vbNewLine
            res_text.Text &= "N30 T0 S3000 F300 G17 M6" & "*" & vbNewLine
            res_text.Text &= "N40 G00 G90 G40 X" & pos_neg & " Y" & posy_pos & " Z20 M13" & "*" & vbNewLine
            res_text.Text &= "N50 G01 Z0" & vbNewLine
            pos = pos_neg
            res_text.Text &= "N60 G00 Y" & resto & "*" & vbNewLine
            temp = resto + pss
            pos = pos_pos
            NLINHA = 70
            For index As Integer = 1 To pass
                res_text.Text &= "N" & NLINHA & " G01 X" & pos & "*" & vbNewLine
                NLINHA += 10
                res_text.Text &= "N" & NLINHA & " G00 Y" & temp & "*" & vbNewLine
                NLINHA += 10
                temp = temp + pss
                If pos <> pos_pos Then
                    pos = pos_pos
                Else
                    pos = pos_neg
                End If
            Next
            res_text.Text &= "N" & NLINHA & " G01 X" & pos & "*" & vbNewLine
        End If
    End Sub
    Public Sub folder_select()
        Dim theFolderBrowser As New FolderBrowserDialog
        theFolderBrowser.Description = "Escolha a pasta."
        theFolderBrowser.ShowNewFolderButton = False
        theFolderBrowser.RootFolder = System.Environment.SpecialFolder.Desktop
        theFolderBrowser.SelectedPath = My.Computer.FileSystem.SpecialDirectories.Desktop
        ' If the user clicks theFolderBrowser's OK button..
        If theFolderBrowser.ShowDialog = Windows.Forms.DialogResult.OK Then
            ' Set the FolderChoiceTextBox's Text to theFolderBrowserDialog's
            '    SelectedPath property.
            Me.FolderChoiceTextBox.Text = theFolderBrowser.SelectedPath
            Dim Path = IO.Path.Combine(Application.StartupPath, "sst.bat")
            Dim sst As FileStream = File.Create(Path)
            Dim info As Byte() = New UTF8Encoding(True).GetBytes(theFolderBrowser.SelectedPath)
            sst.Write(info, 0, info.Length)
            sst.Close()
        Else
            Me.FolderChoiceTextBox.Text = theFolderBrowser.SelectedPath
            FolderChoiceTextBox.ReadOnly = True
        End If
    End Sub
    Private Sub check0_Click(sender As Object, e As EventArgs) Handles check0.Click
        check1.CheckState = 0
        check0.CheckState = 1
    End Sub
    Private Sub check1_Click(sender As Object, e As EventArgs) Handles check1.Click
        check1.CheckState = 1
        check0.CheckState = 0
    End Sub
    Private Sub save_file_Click(sender As Object, e As EventArgs) Handles save_file.Click
        If FolderChoiceTextBox.Text = "" Then
            folder_select()
        End If
        save_face.Main(res_text.Text)
        save_file.Text = "gravado"
    End Sub
    Private Sub face_TAB_Enter(sender As Object, e As EventArgs) Handles face_TAB.Enter
        define_path()
    End Sub
    Private Sub FolderChoiceTextBox_MouseDoubleClick(sender As Object, e As MouseEventArgs) Handles FolderChoiceTextBox.MouseDoubleClick
        FolderChoiceTextBox.Text = ""
        FolderChoiceTextBox.ReadOnly = False
        folder_select()
    End Sub
    Private Sub define_path()


        Dim Path = IO.Path.Combine(Application.StartupPath, "sst.bat")

        If System.IO.File.Exists(Path) Then
            Dim objReader As New StreamReader(Path)
            Dim sLine As String = ""
            Dim arrText As New ArrayList()
            Do
                sLine = objReader.ReadLine()
                If Not sLine Is Nothing Then
                    arrText.Add(sLine)
                End If
            Loop Until sLine Is Nothing
            objReader.Close()
            For Each sLine In arrText
                'Console.WriteLine(sLine)
            Next
            'Console.ReadLine()
            FolderChoiceTextBox.Text = sLine
            FolderChoiceTextBox.ReadOnly = True
        End If
    End Sub
    Private Sub vl_fresa_LostFocus(sender As Object, e As EventArgs) Handles vl_fresa.LostFocus
        check_dot(vl_fresa)
    End Sub
    Private Sub vl_lp_LostFocus(sender As Object, e As EventArgs) Handles vl_lp.LostFocus
        check_dot(vl_lp)
    End Sub
    Private Sub check_dot(tmp)
        tmp.Text = tmp.Text.Replace(".", ",")
    End Sub
    Private Sub vl_cp_LostFocus(sender As Object, e As EventArgs) Handles vl_cp.LostFocus
        check_dot(vl_cp)
    End Sub
    Private Sub vl_z_LostFocus(sender As Object, e As EventArgs) Handles vl_z.LostFocus
        check_dot(vl_z)
    End Sub
    Private Sub co_value_LostFocus(sender As Object, e As EventArgs) Handles co_value.LostFocus
        check_dot(co_value)
        check_fill(co_value)
    End Sub
    Private Sub ca_value_LostFocus(sender As Object, e As EventArgs) Handles ca_value.LostFocus
        check_dot(ca_value)
        check_fill(ca_value)
    End Sub
    Private Sub h_value_LostFocus(sender As Object, e As EventArgs) Handles h_value.LostFocus
        check_dot(h_value)
        check_fill(h_value)
    End Sub
    Private Sub angulo_value_LostFocus(sender As Object, e As EventArgs) Handles angulo_value.LostFocus
        check_dot(angulo_value)
        check_fill(angulo_value)
    End Sub
    Private Sub check_fill(tmp)
        If tmp.text <> "" Then
            opc_tri.Text = opc_tri.Text + 1
        End If
    End Sub
    Private Sub mat_combo_SelectedIndexChanged(sender As Object, e As EventArgs)
        If past_value.CheckState = CheckState.Checked Then
            calc_f(1)
        ElseIf hss_value.CheckState = CheckState.Checked Then
            calc_f(2)
        Else
            calc_f(3)
        End If
    End Sub
    Private Sub ndentes_LostFocus(sender As Object, e As EventArgs) Handles ndentes.LostFocus
        check_dot(ndentes)
    End Sub
    Private Sub ndentes_SelectedIndexChanged(sender As Object, e As EventArgs) Handles ndentes.SelectedIndexChanged
        calc_avan()
    End Sub
    Private Sub fdente_LostFocus(sender As Object, e As EventArgs) Handles fdente.LostFocus
        check_dot(fdente)
    End Sub
    Private Sub fdente_SelectedIndexChanged(sender As Object, e As EventArgs) Handles fdente.SelectedIndexChanged
        calc_avan()
    End Sub
    Private Sub vc_opc_DoubleClick(sender As Object, e As EventArgs) Handles vc_opc.DoubleClick
        If vc_opc.Text <> "" Then
            Clipboard.SetText(vc_opc.Text)
            copy3.Visible = True
            clipb3.Visible = True
            clipb3.Text = vc_opc.Text
        End If
    End Sub
    Private Sub f_value_DoubleClick(sender As Object, e As EventArgs) Handles f_value.DoubleClick
        If f_value.Text <> "" Then
            Clipboard.SetText(f_value.Text)
            copy3.Visible = True
            clipb3.Visible = True
            clipb3.Text = f_value.Text
        End If
    End Sub
    Private Sub diam_value_TextChanged(sender As Object, e As EventArgs) Handles diam_value.TextChanged
        calc_vc()
        calc_avan()
        Vc_fresa.calc_inc()
        Vc_fresa.calc_numdentes()

    End Sub
    Private Sub Button2_Click(sender As Object, e As EventArgs) Handles Button2.Click
        If gr_graus.Text <> "" Then
            gr_rad.Text = (gr_graus.Text * Math.PI) / 180
        ElseIf gr_rad.Text <> "" Then
            gr_graus.Text = (gr_rad.Text * 180) / Math.PI
        End If

    End Sub

    Private Sub reset_MouseEnter(sender As Object, e As EventArgs) Handles reset.MouseEnter
        reset.Image = contas.My.Resources.Resources.clean_over
    End Sub

    Private Sub reset_MouseLeave(sender As Object, e As EventArgs) Handles reset.MouseLeave
        reset.Image = contas.My.Resources.Resources.clean
    End Sub

    Private Sub bt_calc_trig_Click(sender As Object, e As EventArgs) Handles bt_calc_trig.Click
        calc_ang()

    End Sub

    Private Sub bt_calc_trig_MouseEnter1(sender As Object, e As EventArgs) Handles bt_calc_trig.MouseEnter
        bt_calc_trig.Image = contas.My.Resources.Resources.calc_over
    End Sub

    Private Sub bt_calc_trig_MouseLeave1(sender As Object, e As EventArgs) Handles bt_calc_trig.MouseLeave
        bt_calc_trig.Image = contas.My.Resources.Resources.calc1
    End Sub

    Private Sub mat_list_SelectedIndexChanged(sender As Object, e As EventArgs)
        'MsgBox(mat_list.SelectedIndex)
        'mat_list.Items.Add("123")


        If past_value.CheckState = CheckState.Checked Then

            calc_f(1)

        ElseIf hss_value.CheckState = CheckState.Checked Then
            calc_f(2)
        Else
            calc_f(3)
        End If

    End Sub

    
    Private Sub pb_calc_Click(sender As Object, e As EventArgs) Handles pb_calc.Click
        Dim tmp, tmp2 As Double
        tmp = ((pb_ang.Text / 2) * Math.PI) / 180
        tmp2 = pb_diam.Text / 2
        tmp = Math.Tan(tmp)
        pb_res.Text = Math.Round(tmp2 / tmp, 3)


    End Sub

  
    Private Sub vc_f_new_Click(sender As Object, e As EventArgs) Handles vc_f_new.Click
        'MsgBox(mat_list.SelectedIndex)
        'mat_list.Items.Add("123")
        Dim mat, vc1, vc2, vc3 As String

        mat = InputBox("mat", vbOKCancel)
        vc1 = InputBox("vc - past", vbOKCancel, )
        vc2 = InputBox("vc - hss", vbOKCancel, )
        vc3 = InputBox("vc - metal duro", vbOKCancel, )
        Vc_fresa.save_mat(vc1, vc2, vc3, mat)

    End Sub
   
   

    Private Sub Form1_Load(sender As Object, e As EventArgs) Handles Me.Load
        '      show_mat()
        Vc_tornos.start()
    End Sub

    Private Sub TextBox1_TextChanged(sender As Object, e As EventArgs) Handles TextBox1.TextChanged
        vc_opc.Text = TextBox1.Text
    End Sub
    

    Private Sub inc_1_CheckedChanged_1(sender As Object, e As EventArgs) Handles inc_1.CheckedChanged
        If inc_1.CheckState = CheckState.Checked Then
            inc_2.CheckState = CheckState.Unchecked
        End If
        calc_inc()
    End Sub

    Private Sub inc_2_CheckedChanged_1(sender As Object, e As EventArgs) Handles inc_2.CheckedChanged
        If inc_2.CheckState = CheckState.Checked Then
            inc_1.CheckState = CheckState.Unchecked
        End If
        calc_inc()
    End Sub

    Private Sub dm_value_TextChanged(sender As Object, e As EventArgs) Handles dm_value.TextChanged
        rosca.calc_passo()
    End Sub

    Private Sub Button3_Click(sender As Object, e As EventArgs) Handles Button3.Click
        Dim mat, vc1, vc2, vc3, vc4, vc5 As String

        mat = InputBox("mat", vbOKCancel)
        vc1 = InputBox("vc - past", vbOKCancel, )
        vc2 = InputBox("vc - hss", vbOKCancel, )
        vc3 = InputBox("vc - metal duro", vbOKCancel, )
        vc4 = InputBox("vc - rosca/pastilhas", vbOKCancel, )
        vc5 = InputBox("vc - ranhurar/sangrar", vbOKCancel, )
        Vc_tornos.save_mat(vc1, vc2, vc3, vc4, vc5, mat)

    End Sub


    Private Sub past_value_torno_CheckedChanged(sender As Object, e As EventArgs) Handles past_value_torno.CheckedChanged

        If past_value_torno.CheckState = CheckState.Checked Then
            past_value_torno2.CheckState = CheckState.Unchecked
            past_value_torno3.CheckState = CheckState.Unchecked
            past_value_torno4.CheckState = CheckState.Unchecked
            past_value_torno5.CheckState = CheckState.Unchecked
            Vc_tornos.torno_mat = 1
    
            torno_show_mat(1)

            Vc_tornos.calc_n()

        End If


    End Sub

    Private Sub past_value_torno2_CheckedChanged(sender As Object, e As EventArgs) Handles past_value_torno2.CheckedChanged
        If past_value_torno2.CheckState = CheckState.Checked Then
            past_value_torno.CheckState = CheckState.Unchecked
            past_value_torno3.CheckState = CheckState.Unchecked
            past_value_torno4.CheckState = CheckState.Unchecked
            past_value_torno5.CheckState = CheckState.Unchecked
            Vc_tornos.torno_mat = 2

            torno_show_mat(2)

            Vc_tornos.calc_n()
        End If
    
    End Sub

    Private Sub past_value_torno3_CheckedChanged(sender As Object, e As EventArgs) Handles past_value_torno3.CheckedChanged
        If past_value_torno3.CheckState = CheckState.Checked Then
            past_value_torno2.CheckState = CheckState.Unchecked
            past_value_torno.CheckState = CheckState.Unchecked
            past_value_torno4.CheckState = CheckState.Unchecked
            past_value_torno5.CheckState = CheckState.Unchecked
            Vc_tornos.torno_mat = 3


            torno_show_mat(3)

            Vc_tornos.calc_n()
        End If


    End Sub

    Private Sub past_value_torno4_CheckedChanged(sender As Object, e As EventArgs) Handles past_value_torno4.CheckedChanged
        If past_value_torno4.CheckState = CheckState.Checked Then
            past_value_torno2.CheckState = CheckState.Unchecked
            past_value_torno3.CheckState = CheckState.Unchecked
            past_value_torno.CheckState = CheckState.Unchecked
            past_value_torno5.CheckState = CheckState.Unchecked
            Vc_tornos.torno_mat = 4


            torno_show_mat(4)

            Vc_tornos.calc_n()
        End If


    End Sub

    Private Sub past_value_torno5_CheckedChanged(sender As Object, e As EventArgs) Handles past_value_torno5.CheckedChanged
        If past_value_torno5.CheckState = CheckState.Checked Then
            past_value_torno2.CheckState = CheckState.Unchecked
            past_value_torno3.CheckState = CheckState.Unchecked
            past_value_torno4.CheckState = CheckState.Unchecked
            past_value_torno.CheckState = CheckState.Unchecked
            Vc_tornos.torno_mat = 5


            torno_show_mat(5)

            Vc_tornos.calc_n()
        End If


    End Sub


    Private Sub vc_torno_calc_Click(sender As Object, e As EventArgs) Handles vc_torno_calc.Click


        Vc_tornos.calc_n()
        Vc_tornos.calc_f()


    End Sub

    Private Sub mats_torno_CellClick(sender As Object, e As DataGridViewCellEventArgs) Handles mats_torno.CellClick
        If Vc_tornos.torno_mat_selected <> mats_torno.CurrentRow.Index() Then
            Dim i = mats_torno.CurrentRow.Index()
            Vc_tornos.torno_mat_selected = i
            vc_t.Text = mats_torno.Rows.Item(i).Cells(1).Value
            Vc_tornos.calc_n()
        End If
    End Sub

    Private Sub fr_mat_list_CellClick(sender As Object, e As DataGridViewCellEventArgs) Handles fr_mat_list.CellClick
        If Vc_fresa.fresa_mat_selected <> fr_mat_list.CurrentRow.Index() Then
            Dim i = fr_mat_list.CurrentRow.Index()
            Vc_fresa.fresa_mat_selected = i
            vc_opc.Text = fr_mat_list.Rows.Item(i).Cells(1).Value
            'Vc_tornos.calc_n()
        End If
    End Sub

   
End Class
Module save_face

    Sub Main(temp)
        Dim path As String = Form1.FolderChoiceTextBox.Text & "\" & Form1.nome_file.Text

        ' Create or overwrite the file. 
        Dim fs As FileStream = File.Create(path)
        Dim tmp

        tmp = "%AUTO G71 *" & vbNewLine
        tmp &= temp & "N99999999 %AUTO G71 *"


        ' Add text to the file. 
        Dim info As Byte() = New UTF8Encoding(True).GetBytes(tmp)
        fs.Write(info, 0, info.Length)
        fs.Close()
    End Sub


End Module


