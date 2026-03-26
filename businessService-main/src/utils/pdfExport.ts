import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { AnalysisResult } from '@/services/types';

/**
 * 导出分析结果为PDF文档
 */
export const exportToPDF = async (results: AnalysisResult): Promise<void> => {
  try {
    // 创建PDF文档
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margins = 15; // 页边距，单位为mm
    
    // 添加标题
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Analysis Report: ${results.keyword}`, margins, 20);
    
    // 添加日期范围
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Date Range: ${results.dateRange}`, margins, 30);
    pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, margins, 35);
    
    // 添加分隔线
    pdf.setLineWidth(0.5);
    pdf.line(margins, 40, pageWidth - margins, 40);
    
    // 获取趋势图和情感分析图的HTML元素
    const chartElements = document.querySelectorAll('.chart-for-pdf');
    let currentY = 45;
    
    // 添加图表
    if (chartElements.length > 0) {
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Data Visualizations', margins, currentY);
      currentY += 10;
      
      // 遍历每个图表元素并添加到PDF
      for (let i = 0; i < chartElements.length; i++) {
        const element = chartElements[i] as HTMLElement;
        const canvas = await html2canvas(element, {
          scale: 2, // 提高分辨率
          logging: false,
          useCORS: true
        });
        
        // 将画布转换为图像
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth - (2 * margins);
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // 如果当前页空间不足，添加新页
        if (currentY + imgHeight > pageHeight - margins) {
          pdf.addPage();
          currentY = margins;
        }
        
        // 添加图表标题
        const titleElement = element.querySelector('h2');
        if (titleElement) {
          pdf.setFontSize(14);
          pdf.text(titleElement.textContent || '', margins, currentY);
          currentY += 7;
        }
        
        // 添加图表图像
        pdf.addImage(imgData, 'PNG', margins, currentY, imgWidth, imgHeight);
        currentY += imgHeight + 15;
      }
    }
    
    // 添加新页以显示分析结果
    pdf.addPage();
    currentY = margins;
    
    // 添加分析结论标题
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Analysis Conclusions', margins, currentY);
    currentY += 10;
    
    // 添加结构化分析内容
    if (results.structuredAnalysis) {
      // 整体分析
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Overall Analysis', margins, currentY);
      currentY += 7;
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      const overallAnalysisLines = pdf.splitTextToSize(
        results.structuredAnalysis.overallAnalysis, 
        pageWidth - (2 * margins)
      );
      pdf.text(overallAnalysisLines, margins, currentY);
      currentY += overallAnalysisLines.length * 6 + 10;
      
      // 如果页面空间不足，添加新页
      if (currentY > pageHeight - 40) {
        pdf.addPage();
        currentY = margins;
      }
      
      // 建议
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Recommendation', margins, currentY);
      currentY += 7;
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      const recommendationLines = pdf.splitTextToSize(
        results.structuredAnalysis.recommendation, 
        pageWidth - (2 * margins)
      );
      pdf.text(recommendationLines, margins, currentY);
      currentY += recommendationLines.length * 6 + 10;
      
      // 如果页面空间不足，添加新页
      if (currentY > pageHeight - 40) {
        pdf.addPage();
        currentY = margins;
      }
      
      // 预估数量
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Estimated Units', margins, currentY);
      currentY += 7;
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      const estimatedUnitsLines = pdf.splitTextToSize(
        results.structuredAnalysis.estimatedUnits, 
        pageWidth - (2 * margins)
      );
      pdf.text(estimatedUnitsLines, margins, currentY);
      currentY += estimatedUnitsLines.length * 6 + 10;
      
      // 如果页面空间不足，添加新页
      if (currentY > pageHeight - 40) {
        pdf.addPage();
        currentY = margins;
      }
      
      // 重要考虑因素
      if (results.structuredAnalysis.considerations.length > 0) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Important Considerations', margins, currentY);
        currentY += 7;
        
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        
        for (const consideration of results.structuredAnalysis.considerations) {
          const bulletPoint = `• ${consideration}`;
          const considerationLines = pdf.splitTextToSize(
            bulletPoint, 
            pageWidth - (2 * margins) - 5
          );
          
          // 如果页面空间不足，添加新页
          if (currentY + considerationLines.length * 6 > pageHeight - margins) {
            pdf.addPage();
            currentY = margins;
          }
          
          pdf.text(considerationLines, margins + 5, currentY);
          currentY += considerationLines.length * 6 + 5;
        }
        
        currentY += 5;
      }
      
      // 如果页面空间不足，添加新页
      if (currentY > pageHeight - 40 && results.structuredAnalysis.disclaimer) {
        pdf.addPage();
        currentY = margins;
      }
      
      // 免责声明
      if (results.structuredAnalysis.disclaimer) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Disclaimer', margins, currentY);
        currentY += 7;
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'italic');
        const disclaimerLines = pdf.splitTextToSize(
          results.structuredAnalysis.disclaimer, 
          pageWidth - (2 * margins)
        );
        pdf.text(disclaimerLines, margins, currentY);
      }
    } else {
      // 处理非结构化分析数据
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Analysis', margins, currentY);
      currentY += 7;
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      const analysisLines = pdf.splitTextToSize(
        results.analysis, 
        pageWidth - (2 * margins)
      );
      pdf.text(analysisLines, margins, currentY);
      currentY += analysisLines.length * 6 + 10;
      
      // 如果页面空间不足，添加新页
      if (currentY > pageHeight - 40) {
        pdf.addPage();
        currentY = margins;
      }
      
      // 建议
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Recommendations', margins, currentY);
      currentY += 7;
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      
      for (const recommendation of results.recommendations) {
        const bulletPoint = `• ${recommendation}`;
        const recommendationLines = pdf.splitTextToSize(
          bulletPoint, 
          pageWidth - (2 * margins) - 5
        );
        
        // 如果页面空间不足，添加新页
        if (currentY + recommendationLines.length * 6 > pageHeight - margins) {
          pdf.addPage();
          currentY = margins;
        }
        
        pdf.text(recommendationLines, margins + 5, currentY);
        currentY += recommendationLines.length * 6 + 5;
      }
    }
    
    // 添加页脚
    const totalPages = 1;
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(
        `Page ${i} of ${totalPages} | Generated by Product Market Analysis Tool`, 
        pageWidth / 2, 
        pageHeight - 10, 
        { align: 'center' }
      );
    }
    
    // 保存PDF文件
    pdf.save(`${results.keyword.replace(/\s+/g, '_')}_analysis_report.pdf`);
    
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    alert('Failed to generate PDF. Please try again.');
  }
};